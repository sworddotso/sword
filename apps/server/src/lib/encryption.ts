import {
	createCipheriv,
	createDecipheriv,
	pbkdf2Sync,
	randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

interface EncryptedData {
	encryptedText: string;
	iv: string;
	tag: string;
	salt: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Crypto utility class pattern
export class MessageEncryption {
	private static deriveKey(password: string, salt: Buffer): Buffer {
		return pbkdf2Sync(password, salt, 100000, KEY_LENGTH, "sha256");
	}

	public static encrypt(text: string, password: string): EncryptedData {
		const salt = randomBytes(SALT_LENGTH);
		const key = MessageEncryption.deriveKey(password, salt);
		const iv = randomBytes(IV_LENGTH);

		const cipher = createCipheriv(ALGORITHM, key, iv);

		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		const tag = cipher.getAuthTag();

		return {
			encryptedText: encrypted,
			iv: iv.toString("hex"),
			tag: tag.toString("hex"),
			salt: salt.toString("hex"),
		};
	}

	public static decrypt(
		encryptedData: EncryptedData,
		password: string,
	): string {
		const salt = Buffer.from(encryptedData.salt, "hex");
		const key = MessageEncryption.deriveKey(password, salt);
		const iv = Buffer.from(encryptedData.iv, "hex");
		const tag = Buffer.from(encryptedData.tag, "hex");

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);

		let decrypted = decipher.update(encryptedData.encryptedText, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	}

	public static generateConversationKey(): string {
		return randomBytes(32).toString("hex");
	}

	public static encryptMessage(
		content: string,
		conversationKey: string,
	): string {
		const encryptedData = MessageEncryption.encrypt(content, conversationKey);
		return JSON.stringify(encryptedData);
	}

	public static decryptMessage(
		encryptedContent: string,
		conversationKey: string,
	): string {
		const encryptedData: EncryptedData = JSON.parse(encryptedContent);
		return MessageEncryption.decrypt(encryptedData, conversationKey);
	}
}
