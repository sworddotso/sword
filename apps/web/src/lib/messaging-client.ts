import { trpcClient } from "@/utils/trpc";
import { decryptMessage } from "./crypto";
import { getPrivateKey } from "./key-manager";

export interface DecryptedMessage {
	id: string;
	type: "text" | "image" | "file" | "system";
	content: string;
	isEdited: boolean;
	isDeleted: boolean;
	createdAt: Date;
	updatedAt: Date;
	replyToMessageId?: string;
	metadata?: string;
	sender: {
		id: string;
		name: string;
		email: string;
		image?: string;
	};
}

export interface Conversation {
	id: string;
	type: "direct" | "group";
	name?: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ConversationParticipant {
	id: string;
	name: string;
	email: string;
	image?: string;
	publicKey?: string;
}

const publicKeyCache = new Map<string, string>();

export async function sendMessage(params: {
	conversationId: string;
	content: string;
	type?: "text" | "image" | "file" | "system";
	replyToMessageId?: string;
	metadata?: string;
}): Promise<{ messageId: string }> {
	return await trpcClient.sendMessage.mutate({
		conversationId: params.conversationId,
		content: params.content,
		type: params.type || "text",
		replyToMessageId: params.replyToMessageId,
		metadata: params.metadata,
	});
}

export async function getMessages(params: {
	conversationId: string;
	limit?: number;
	beforeMessageId?: string;
	userId: string;
}): Promise<DecryptedMessage[]> {
	const privateKey = getPrivateKey(params.userId);
	if (!privateKey) {
		throw new Error(
			"No private key available. Please sign in again to set up encryption.",
		);
	}

	const encryptedMessages = await trpcClient.getMessages.query({
		conversationId: params.conversationId,
		limit: params.limit,
		beforeMessageId: params.beforeMessageId,
	});

	const decryptedMessages: DecryptedMessage[] = [];

	for (const message of encryptedMessages) {
		try {
			let content = "";

			if (message.encrypted) {
				const decrypted = await decryptMessage(
					{
						encryptedContent: message.encrypted.content,
						encryptedKey: message.encrypted.key,
					},
					privateKey,
				);
				content = decrypted.content;
			} else {
				content = "[Unable to decrypt message]";
			}

			decryptedMessages.push({
				id: message.id,
				type: message.type as "text" | "image" | "file" | "system",
				content,
				isEdited: message.isEdited,
				isDeleted: message.isDeleted,
				createdAt: new Date(message.createdAt),
				updatedAt: new Date(message.updatedAt),
				replyToMessageId: message.replyToMessageId || undefined,
				metadata: message.metadata || undefined,
				sender: message.sender,
			});
		} catch (error) {
			console.error(`Failed to decrypt message ${message.id}:`, error);

			decryptedMessages.push({
				id: message.id,
				type: message.type as "text" | "image" | "file" | "system",
				content: "[Failed to decrypt message]",
				isEdited: message.isEdited,
				isDeleted: message.isDeleted,
				createdAt: new Date(message.createdAt),
				updatedAt: new Date(message.updatedAt),
				replyToMessageId: message.replyToMessageId || undefined,
				metadata: message.metadata || undefined,
				sender: message.sender,
			});
		}
	}

	return decryptedMessages;
}

export async function createConversation(params: {
	type?: "direct" | "group";
	name?: string;
	description?: string;
	participantUserIds: string[];
}): Promise<{ conversationId: string }> {
	return await trpcClient.createConversation.mutate(params);
}

export async function getConversations(): Promise<Conversation[]> {
	const conversations = await trpcClient.getConversations.query();
	return conversations.map((conv) => ({
		...conv,
		createdAt: new Date(conv.createdAt),
		updatedAt: new Date(conv.updatedAt),
	}));
}

export async function getConversationParticipants(
	conversationId: string,
): Promise<ConversationParticipant[]> {
	return await trpcClient.getUsersForConversation.query({ conversationId });
}

export async function markMessageAsRead(messageId: string): Promise<void> {
	await trpcClient.markMessageAsRead.mutate({ messageId });
}

export async function getPublicKey(userId: string): Promise<string | null> {
	const cached = publicKeyCache.get(userId);
	if (cached) {
		return cached;
	}

	try {
		const result = await trpcClient.getPublicKey.query({ userId });
		if (result.publicKey) {
			publicKeyCache.set(userId, result.publicKey);
			return result.publicKey;
		}
		return null;
	} catch (error) {
		console.error(`Failed to get public key for user ${userId}:`, error);
		return null;
	}
}

export async function getPublicKeys(
	userIds: string[],
): Promise<Array<{ userId: string; publicKey: string | null }>> {
	const result = await trpcClient.getPublicKeys.query({ userIds });

	for (const { userId, publicKey } of result) {
		if (publicKey) {
			publicKeyCache.set(userId, publicKey);
		}
	}

	return result;
}

export function clearCache(): void {
	publicKeyCache.clear();
}
