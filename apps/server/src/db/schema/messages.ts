import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const conversationTypeEnum = pgEnum("conversation_type", [
	"direct",
	"group",
]);

export const messageTypeEnum = pgEnum("message_type", [
	"text",
	"image",
	"file",
	"system",
]);

export const conversation = pgTable("conversation", {
	id: text("id").primaryKey(),
	type: conversationTypeEnum("type").notNull().default("direct"),
	name: text("name"),
	description: text("description"),
	isEncrypted: boolean("is_encrypted").notNull().default(true),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	createdByUserId: text("created_by_user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const conversationParticipant = pgTable("conversation_participant", {
	id: text("id").primaryKey(),
	conversationId: text("conversation_id")
		.notNull()
		.references(() => conversation.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	joinedAt: timestamp("joined_at").notNull(),
	leftAt: timestamp("left_at"),
	isAdmin: boolean("is_admin").notNull().default(false),
	publicKey: text("public_key"),
});

export const message = pgTable("message", {
	id: text("id").primaryKey(),
	conversationId: text("conversation_id")
		.notNull()
		.references(() => conversation.id, { onDelete: "cascade" }),
	senderId: text("sender_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: messageTypeEnum("type").notNull().default("text"),
	metadata: text("metadata"),
	replyToMessageId: text("reply_to_message_id"),
	isEdited: boolean("is_edited").notNull().default(false),
	isDeleted: boolean("is_deleted").notNull().default(false),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const messageRecipient = pgTable("message_recipient", {
	id: text("id").primaryKey(),
	messageId: text("message_id")
		.notNull()
		.references(() => message.id, { onDelete: "cascade" }),
	recipientId: text("recipient_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	encryptedContent: text("encrypted_content").notNull(),
	encryptedKey: text("encrypted_key").notNull(),
});

export const messageDelivery = pgTable("message_delivery", {
	id: text("id").primaryKey(),
	messageId: text("message_id")
		.notNull()
		.references(() => message.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	deliveredAt: timestamp("delivered_at"),
	readAt: timestamp("read_at"),
});
