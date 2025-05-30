import {
	createCipheriv,
	createDecipheriv,
	generateKeyPairSync,
	privateDecrypt,
	publicEncrypt,
	randomBytes,
} from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const RSA_KEY_SIZE = 2048;

export interface KeyPair {
	publicKey: string;
	privateKey: string;
}

export interface EncryptedMessage {
	encryptedContent: string;
	iv: string;
	tag: string;
}

export interface E2EEMessageData {
	recipientId: string;
	encryptedContent: string;
	encryptedKey: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: E2EE crypto utility class pattern
export class E2EECrypto {
	/**
	 * Generate RSA key pair for a user
	 */
	public static generateKeyPair(): KeyPair {
		const { publicKey, privateKey } = generateKeyPairSync("rsa", {
			modulusLength: RSA_KEY_SIZE,
			publicKeyEncoding: {
				type: "spki",
				format: "pem",
			},
			privateKeyEncoding: {
				type: "pkcs8",
				format: "pem",
			},
		});

		return {
			publicKey,
			privateKey,
		};
	}

	/**
	 * Encrypt a message using AES
	 */
	private static encryptWithAES(
		content: string,
		key: Buffer,
	): EncryptedMessage {
		const iv = randomBytes(16);
		const cipher = createCipheriv(AES_ALGORITHM, key, iv);

		let encrypted = cipher.update(content, "utf8", "hex");
		encrypted += cipher.final("hex");

		const tag = cipher.getAuthTag();

		return {
			encryptedContent: encrypted,
			iv: iv.toString("hex"),
			tag: tag.toString("hex"),
		};
	}

	/**
	 * Decrypt a message using AES
	 */
	private static decryptWithAES(
		encryptedMessage: EncryptedMessage,
		key: Buffer,
	): string {
		const iv = Buffer.from(encryptedMessage.iv, "hex");
		const tag = Buffer.from(encryptedMessage.tag, "hex");

		const decipher = createDecipheriv(AES_ALGORITHM, key, iv);
		decipher.setAuthTag(tag);

		let decrypted = decipher.update(
			encryptedMessage.encryptedContent,
			"hex",
			"utf8",
		);
		decrypted += decipher.final("utf8");

		return decrypted;
	}

	/**
	 * Encrypt a message for a specific recipient using their public key
	 */
	public static encryptForRecipient(
		content: string,
		recipientPublicKey: string,
	): E2EEMessageData {
		// Generate random AES key for this message
		const messageKey = randomBytes(32);

		// Encrypt the content with AES
		const encryptedMessage = E2EECrypto.encryptWithAES(content, messageKey);

		// Encrypt the AES key with recipient's RSA public key
		const encryptedKey = publicEncrypt(
			{
				key: recipientPublicKey,
				padding: 1, // OAEP padding
			},
			messageKey,
		);

		return {
			recipientId: "", // This will be set by the caller
			encryptedContent: JSON.stringify(encryptedMessage),
			encryptedKey: encryptedKey.toString("base64"),
		};
	}

	/**
	 * Decrypt a message using the recipient's private key
	 */
	public static decryptForRecipient(
		encryptedData: E2EEMessageData,
		recipientPrivateKey: string,
	): string {
		// Decrypt the AES key with recipient's RSA private key
		const encryptedKeyBuffer = Buffer.from(
			encryptedData.encryptedKey,
			"base64",
		);
		const messageKey = privateDecrypt(
			{
				key: recipientPrivateKey,
				padding: 1, // OAEP padding
			},
			encryptedKeyBuffer,
		);

		// Parse the encrypted message
		const encryptedMessage: EncryptedMessage = JSON.parse(
			encryptedData.encryptedContent,
		);

		// Decrypt the content with the AES key
		return E2EECrypto.decryptWithAES(encryptedMessage, messageKey);
	}

	/**
	 * Encrypt a message for multiple recipients
	 */
	public static encryptForRecipients(
		content: string,
		recipients: Array<{ id: string; publicKey: string }>,
	): E2EEMessageData[] {
		return recipients.map((recipient) => {
			const encryptedData = E2EECrypto.encryptForRecipient(
				content,
				recipient.publicKey,
			);
			return {
				...encryptedData,
				recipientId: recipient.id,
			};
		});
	}

	/**
	 * Validate public key format
	 */
	public static isValidPublicKey(publicKey: string): boolean {
		try {
			// Try to use the key for encryption with a test message
			const testKey = randomBytes(32);
			publicEncrypt(
				{
					key: publicKey,
					padding: 1,
				},
				testKey,
			);
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Validate private key format
	 */
	public static isValidPrivateKey(privateKey: string): boolean {
		try {
			// Try to extract public key from private key
			const keyObject = require("node:crypto").createPrivateKey(privateKey);
			const publicKey = require("node:crypto")
				.createPublicKey(keyObject)
				.export({
					type: "spki",
					format: "pem",
				});
			return (
				typeof publicKey === "string" && publicKey.includes("BEGIN PUBLIC KEY")
			);
		} catch (error) {
			return false;
		}
	}

	/**
	 * Extract public key from private key
	 */
	public static getPublicKeyFromPrivate(privateKey: string): string {
		const keyObject = require("node:crypto").createPrivateKey(privateKey);
		return require("node:crypto").createPublicKey(keyObject).export({
			type: "spki",
			format: "pem",
		});
	}
}
