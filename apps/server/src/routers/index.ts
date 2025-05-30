import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
	conversation,
	conversationParticipant,
	db,
	message,
	messageDelivery,
	messageRecipient,
	user,
	waitlist,
} from "../db";
import { E2EECrypto } from "../lib/e2ee";
import {
	containsSuspiciousContent,
	sanitizeMessageContent,
} from "../lib/sanitization";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { getWebSocketManager } from "../lib/websocket";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	joinWaitlist: publicProcedure
		.input(
			z.object({
				email: z.string().email("Please enter a valid email address"),
				honeypot: z.string().optional(), // Honeypot field for bot detection
			}),
		)
		.mutation(async ({ input }) => {
			// Security: Check honeypot field - if filled, it's likely a bot
			if (input.honeypot && input.honeypot.trim() !== "") {
				// Silently reject without giving feedback to bots
				return {
					success: false,
					message: "Invalid submission. Please try again.",
				};
			}

			try {
				// Check if email already exists
				const existingEmail = await db
					.select()
					.from(waitlist)
					.where(eq(waitlist.email, input.email))
					.limit(1);

				if (existingEmail.length > 0) {
					return {
						success: false,
						message: "This email is already on the waitlist.",
					};
				}

				// Insert new email
				await db.insert(waitlist).values({
					email: input.email,
				});

				return { success: true, message: "Successfully joined the waitlist!" };
			} catch (error) {
				console.error("Waitlist join error:", error);

				// Handle database constraint errors
				if (
					error instanceof Error &&
					error.message.includes("unique constraint")
				) {
					return {
						success: false,
						message: "This email is already on the waitlist.",
					};
				}

				// Generic error for other cases
				return {
					success: false,
					message: "Unable to join waitlist. Please try again later.",
				};
			}
		}),

	// Message endpoints
	createConversation: protectedProcedure
		.input(
			z.object({
				type: z.enum(["direct", "group"]).default("direct"),
				name: z.string().optional(),
				description: z.string().optional(),
				participantUserIds: z.array(z.string()).min(1),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			return await db.transaction(async (tx) => {
				const conversationId = nanoid();
				const now = new Date();

				// Create conversation
				await tx.insert(conversation).values({
					id: conversationId,
					type: input.type,
					name: input.name,
					description: input.description,
					isEncrypted: true,
					createdAt: now,
					updatedAt: now,
					createdByUserId: ctx.session.user.id,
				});

				// Add creator as participant
				await tx.insert(conversationParticipant).values({
					id: nanoid(),
					conversationId,
					userId: ctx.session.user.id,
					joinedAt: now,
					isAdmin: true,
				});

				// Add other participants
				for (const userId of input.participantUserIds) {
					if (userId !== ctx.session.user.id) {
						await tx.insert(conversationParticipant).values({
							id: nanoid(),
							conversationId,
							userId,
							joinedAt: now,
							isAdmin: false,
						});
					}
				}

				return { conversationId };
			});
		}),

	sendMessage: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				content: z.string().min(1),
				type: z.enum(["text", "image", "file", "system"]).default("text"),
				replyToMessageId: z.string().optional(),
				metadata: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Sanitize and validate message content
			if (containsSuspiciousContent(input.content)) {
				throw new Error(
					"Message content contains potentially dangerous elements",
				);
			}

			const sanitizedContent = sanitizeMessageContent(input.content);

			// Verify user is participant in conversation
			const participation = await db
				.select()
				.from(conversationParticipant)
				.where(
					and(
						eq(conversationParticipant.conversationId, input.conversationId),
						eq(conversationParticipant.userId, ctx.session.user.id),
						isNull(conversationParticipant.leftAt),
					),
				)
				.limit(1);

			if (participation.length === 0) {
				throw new Error("Not authorized to send messages in this conversation");
			}

			const messageId = nanoid();
			const now = new Date();

			// Get all participants with their public keys
			const participants = await db
				.select({
					userId: conversationParticipant.userId,
					publicKey: user.publicKey,
				})
				.from(conversationParticipant)
				.innerJoin(user, eq(conversationParticipant.userId, user.id))
				.where(
					and(
						eq(conversationParticipant.conversationId, input.conversationId),
						isNull(conversationParticipant.leftAt),
					),
				);

			// Validate that all participants have public keys
			const participantsWithKeys = participants.filter((p) => p.publicKey);
			if (participantsWithKeys.length !== participants.length) {
				throw new Error(
					"All participants must have public keys for E2EE messaging",
				);
			}

			// Use transaction for all database operations
			await db.transaction(async (tx) => {
				// Insert message (without content - content is stored encrypted per recipient)
				await tx.insert(message).values({
					id: messageId,
					conversationId: input.conversationId,
					senderId: ctx.session.user.id,
					type: input.type,
					replyToMessageId: input.replyToMessageId,
					metadata: input.metadata,
					isEdited: false,
					isDeleted: false,
					createdAt: now,
					updatedAt: now,
				});

				// Encrypt message for each participant using E2EE
				const encryptionPromises = participantsWithKeys.map(
					async (participant) => {
						try {
							const encryptedData = E2EECrypto.encryptForRecipient(
								sanitizedContent,
								participant.publicKey as string,
								participant.userId,
							);

							return { participant, encryptedData };
						} catch (error) {
							console.error(
								`Failed to encrypt message for user ${participant.userId}:`,
								error,
							);
							throw new Error("Failed to encrypt message for all recipients");
						}
					},
				);

				const encryptedResults = await Promise.all(encryptionPromises);

				// Store all encrypted messages and delivery records
				for (const { participant, encryptedData } of encryptedResults) {
					await tx.insert(messageRecipient).values({
						id: nanoid(),
						messageId,
						recipientId: participant.userId,
						encryptedContent: encryptedData.encryptedContent,
						encryptedKey: encryptedData.encryptedKey,
					});

					if (participant.userId !== ctx.session.user.id) {
						await tx.insert(messageDelivery).values({
							id: nanoid(),
							messageId,
							userId: participant.userId,
						});
					}
				}
			});

			// Broadcast message notification via WebSocket (without content for E2EE)
			const wsManager = getWebSocketManager();
			if (wsManager) {
				const messageNotification = {
					id: messageId,
					conversationId: input.conversationId,
					type: input.type,
					replyToMessageId: input.replyToMessageId,
					metadata: input.metadata,
					isEdited: false,
					isDeleted: false,
					createdAt: now,
					updatedAt: now,
					sender: {
						id: ctx.session.user.id,
						name: ctx.session.user.name,
						email: ctx.session.user.email,
						image: ctx.session.user.image,
					},
				};
				wsManager.broadcastNewMessage(
					input.conversationId,
					messageNotification,
				);
			}

			return { messageId };
		}),

	getMessages: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				beforeMessageId: z.string().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Verify user is participant in conversation
			const participation = await db
				.select()
				.from(conversationParticipant)
				.where(
					and(
						eq(conversationParticipant.conversationId, input.conversationId),
						eq(conversationParticipant.userId, ctx.session.user.id),
						isNull(conversationParticipant.leftAt),
					),
				)
				.limit(1);

			if (participation.length === 0) {
				throw new Error("Not authorized to view messages in this conversation");
			}

			// Build where conditions for pagination
			const whereConditions = [
				eq(message.conversationId, input.conversationId),
			];

			// Add pagination condition if beforeMessageId is provided
			if (input.beforeMessageId) {
				// Get the timestamp of the beforeMessageId message for proper pagination
				const beforeMessage = await db
					.select({ createdAt: message.createdAt })
					.from(message)
					.where(eq(message.id, input.beforeMessageId))
					.limit(1);

				if (beforeMessage.length > 0) {
					whereConditions.push(
						lt(message.createdAt, beforeMessage[0].createdAt),
					);
				}
			}

			// Get messages with encrypted content for the requesting user
			const messages = await db
				.select({
					id: message.id,
					type: message.type,
					isEdited: message.isEdited,
					isDeleted: message.isDeleted,
					createdAt: message.createdAt,
					updatedAt: message.updatedAt,
					replyToMessageId: message.replyToMessageId,
					metadata: message.metadata,
					sender: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
					// Get encrypted content for the requesting user
					encryptedContent: messageRecipient.encryptedContent,
					encryptedKey: messageRecipient.encryptedKey,
				})
				.from(message)
				.innerJoin(user, eq(message.senderId, user.id))
				.leftJoin(
					messageRecipient,
					and(
						eq(messageRecipient.messageId, message.id),
						eq(messageRecipient.recipientId, ctx.session.user.id),
					),
				)
				.where(and(...whereConditions))
				.orderBy(desc(message.createdAt))
				.limit(input.limit);

			// Return messages with encrypted content for client-side decryption
			return messages.map((msg) => ({
				id: msg.id,
				type: msg.type,
				isEdited: msg.isEdited,
				isDeleted: msg.isDeleted,
				createdAt: msg.createdAt,
				updatedAt: msg.updatedAt,
				replyToMessageId: msg.replyToMessageId,
				metadata: msg.metadata,
				sender: msg.sender,
				// Include encrypted data for client-side decryption
				encrypted:
					msg.encryptedContent && msg.encryptedKey
						? {
								content: msg.encryptedContent,
								key: msg.encryptedKey,
							}
						: null,
			}));
		}),

	getConversations: protectedProcedure.query(async ({ ctx }) => {
		const conversations = await db
			.select({
				id: conversation.id,
				type: conversation.type,
				name: conversation.name,
				description: conversation.description,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
			})
			.from(conversation)
			.innerJoin(
				conversationParticipant,
				eq(conversation.id, conversationParticipant.conversationId),
			)
			.where(
				and(
					eq(conversationParticipant.userId, ctx.session.user.id),
					isNull(conversationParticipant.leftAt),
				),
			)
			.orderBy(desc(conversation.updatedAt));

		return conversations;
	}),

	markMessageAsRead: protectedProcedure
		.input(
			z.object({
				messageId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const now = new Date();

			// First get the message to find the conversation
			const messageRecord = await db
				.select({ conversationId: message.conversationId })
				.from(message)
				.where(eq(message.id, input.messageId))
				.limit(1);

			if (messageRecord.length === 0) {
				throw new Error("Message not found");
			}

			// First check if delivery record exists and has deliveredAt
			const deliveryRecord = await db
				.select({ deliveredAt: messageDelivery.deliveredAt })
				.from(messageDelivery)
				.where(
					and(
						eq(messageDelivery.messageId, input.messageId),
						eq(messageDelivery.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			// Update with proper deliveredAt handling
			await db
				.update(messageDelivery)
				.set({
					readAt: now,
					deliveredAt: deliveryRecord[0]?.deliveredAt || now,
				})
				.where(
					and(
						eq(messageDelivery.messageId, input.messageId),
						eq(messageDelivery.userId, ctx.session.user.id),
					),
				);

			// Broadcast read status via WebSocket
			const wsManager = getWebSocketManager();
			if (wsManager) {
				wsManager.broadcastMessageRead(
					messageRecord[0].conversationId,
					input.messageId,
					ctx.session.user.id,
				);
			}

			return { success: true };
		}),

	// E2EE Key Management endpoints
	setPublicKey: protectedProcedure
		.input(
			z.object({
				publicKey: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Validate the public key format
			if (!E2EECrypto.isValidPublicKey(input.publicKey)) {
				throw new Error("Invalid public key format");
			}

			await db
				.update(user)
				.set({
					publicKey: input.publicKey,
					updatedAt: new Date(),
				})
				.where(eq(user.id, ctx.session.user.id));

			return { success: true };
		}),

	getPublicKey: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const userRecord = await db
				.select({ publicKey: user.publicKey })
				.from(user)
				.where(eq(user.id, input.userId))
				.limit(1);

			if (userRecord.length === 0) {
				throw new Error("User not found");
			}

			return { publicKey: userRecord[0].publicKey };
		}),

	getPublicKeys: protectedProcedure
		.input(
			z.object({
				userIds: z.array(z.string()),
			}),
		)
		.query(async ({ input }) => {
			// Short-circuit: if array empty, return empty array
			if (input.userIds.length === 0) {
				return [];
			}

			const users = await db
				.select({
					id: user.id,
					publicKey: user.publicKey,
				})
				.from(user)
				.where(or(...input.userIds.map((id) => eq(user.id, id))));

			return users.map((u) => ({
				userId: u.id,
				publicKey: u.publicKey,
			}));
		}),

	getUsersForConversation: protectedProcedure
		.input(
			z.object({
				conversationId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Verify user is participant in conversation
			const participation = await db
				.select()
				.from(conversationParticipant)
				.where(
					and(
						eq(conversationParticipant.conversationId, input.conversationId),
						eq(conversationParticipant.userId, ctx.session.user.id),
						isNull(conversationParticipant.leftAt),
					),
				)
				.limit(1);

			if (participation.length === 0) {
				throw new Error("Not authorized to view conversation participants");
			}

			// Get all participants
			const participants = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					publicKey: user.publicKey,
				})
				.from(user)
				.innerJoin(
					conversationParticipant,
					eq(user.id, conversationParticipant.userId),
				)
				.where(
					and(
						eq(conversationParticipant.conversationId, input.conversationId),
						isNull(conversationParticipant.leftAt),
					),
				);

			return participants;
		}),
});
export type AppRouter = typeof appRouter;
