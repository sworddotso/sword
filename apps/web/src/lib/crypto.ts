export interface KeyPair {
	publicKey: CryptoKey;
	privateKey: CryptoKey;
}

export interface EncryptedMessage {
	encryptedContent: string;
	encryptedKey: string;
}

export interface DecryptedMessage {
	content: string;
}

const RSA_ALGORITHM = {
	name: "RSA-OAEP",
	modulusLength: 2048,
	publicExponent: new Uint8Array([1, 0, 1]),
	hash: "SHA-256",
};

const AES_ALGORITHM = {
	name: "AES-GCM",
	length: 256,
};

export async function generateKeyPair(): Promise<KeyPair> {
	const keyPair = await crypto.subtle.generateKey(RSA_ALGORITHM, true, [
		"encrypt",
		"decrypt",
	]);

	return {
		publicKey: keyPair.publicKey,
		privateKey: keyPair.privateKey,
	};
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
	const exported = await crypto.subtle.exportKey("spki", publicKey);
	const exportedAsString = arrayBufferToBase64(exported);
	return `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
}

export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
	const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
	const exportedAsString = arrayBufferToBase64(exported);
	return `-----BEGIN PRIVATE KEY-----\n${exportedAsString}\n-----END PRIVATE KEY-----`;
}

export async function importPublicKey(pemKey: string): Promise<CryptoKey> {
	const binaryDer = base64ToArrayBuffer(
		pemKey
			.replace("-----BEGIN PUBLIC KEY-----", "")
			.replace("-----END PUBLIC KEY-----", "")
			.replace(/\s/g, ""),
	);

	return await crypto.subtle.importKey(
		"spki",
		binaryDer,
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		false,
		["encrypt"],
	);
}

export async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
	const binaryDer = base64ToArrayBuffer(
		pemKey
			.replace("-----BEGIN PRIVATE KEY-----", "")
			.replace("-----END PRIVATE KEY-----", "")
			.replace(/\s/g, ""),
	);

	return await crypto.subtle.importKey(
		"pkcs8",
		binaryDer,
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		false,
		["decrypt"],
	);
}

export async function encryptMessage(
	content: string,
	recipientPublicKey: CryptoKey,
): Promise<EncryptedMessage> {
	const aesKey = await crypto.subtle.generateKey(AES_ALGORITHM, true, [
		"encrypt",
		"decrypt",
	]);

	const contentBytes = new TextEncoder().encode(content);
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const encryptedContent = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: iv,
		},
		aesKey,
		contentBytes,
	);

	const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);

	const encryptedAesKey = await crypto.subtle.encrypt(
		{
			name: "RSA-OAEP",
		},
		recipientPublicKey,
		exportedAesKey,
	);

	const combinedContent = new Uint8Array(
		iv.length + encryptedContent.byteLength,
	);
	combinedContent.set(iv);
	combinedContent.set(new Uint8Array(encryptedContent), iv.length);

	return {
		encryptedContent: arrayBufferToBase64(combinedContent),
		encryptedKey: arrayBufferToBase64(encryptedAesKey),
	};
}

export async function decryptMessage(
	encryptedMessage: EncryptedMessage,
	privateKey: CryptoKey,
): Promise<DecryptedMessage> {
	const encryptedAesKeyBytes = base64ToArrayBuffer(
		encryptedMessage.encryptedKey,
	);
	const combinedContentBytes = base64ToArrayBuffer(
		encryptedMessage.encryptedContent,
	);

	const aesKeyBytes = await crypto.subtle.decrypt(
		{
			name: "RSA-OAEP",
		},
		privateKey,
		encryptedAesKeyBytes,
	);

	const aesKey = await crypto.subtle.importKey(
		"raw",
		aesKeyBytes,
		AES_ALGORITHM,
		false,
		["decrypt"],
	);

	const iv = combinedContentBytes.slice(0, 12);
	const encryptedContent = combinedContentBytes.slice(12);

	const decryptedContent = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: iv,
		},
		aesKey,
		encryptedContent,
	);

	const content = new TextDecoder().decode(decryptedContent);

	return { content };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

export function isValidPublicKey(publicKey: string): boolean {
	try {
		return (
			publicKey.includes("-----BEGIN PUBLIC KEY-----") &&
			publicKey.includes("-----END PUBLIC KEY-----")
		);
	} catch {
		return false;
	}
}
