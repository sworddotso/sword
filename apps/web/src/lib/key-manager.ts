import {
	type KeyPair,
	exportPrivateKey,
	exportPublicKey,
	generateKeyPair,
	importPrivateKey,
	importPublicKey,
} from "./crypto";

interface StoredKeyPair {
	publicKeyPem: string;
	privateKeyPem: string;
	userId: string;
	createdAt: number;
}

const DB_NAME = "SwordKeys";
const DB_VERSION = 1;
const STORE_NAME = "keypairs";

let db: IDBDatabase | null = null;
const publicKeyCache = new Map<string, CryptoKey>();
let privateKey: CryptoKey | null = null;

export async function initializeDatabase(): Promise<void> {
	if (db) return;

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			db = request.result;
			resolve();
		};

		request.onupgradeneeded = (event) => {
			const database = (event.target as IDBOpenDBRequest).result;
			if (!database.objectStoreNames.contains(STORE_NAME)) {
				const store = database.createObjectStore(STORE_NAME, {
					keyPath: "userId",
				});
				store.createIndex("createdAt", "createdAt", { unique: false });
			}
		};
	});
}

export async function generateAndStoreKeyPair(userId: string): Promise<string> {
	await initializeDatabase();

	const keyPair = await generateKeyPair();
	const publicKeyPem = await exportPublicKey(keyPair.publicKey);
	const privateKeyPem = await exportPrivateKey(keyPair.privateKey);

	const storedKeyPair: StoredKeyPair = {
		userId,
		publicKeyPem,
		privateKeyPem,
		createdAt: Date.now(),
	};

	return new Promise((resolve, reject) => {
		if (!db) {
			reject(new Error("Database not initialized"));
			return;
		}

		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(storedKeyPair);

		request.onsuccess = () => {
			privateKey = keyPair.privateKey;
			resolve(publicKeyPem);
		};
		request.onerror = () => reject(request.error);
	});
}

export async function loadPrivateKey(
	userId: string,
): Promise<CryptoKey | null> {
	if (privateKey) return privateKey;

	await initializeDatabase();

	return new Promise((resolve, reject) => {
		if (!db) {
			reject(new Error("Database not initialized"));
			return;
		}

		const transaction = db.transaction([STORE_NAME], "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(userId);

		request.onsuccess = async () => {
			const result = request.result as StoredKeyPair | undefined;
			if (!result) {
				resolve(null);
				return;
			}

			try {
				privateKey = await importPrivateKey(result.privateKeyPem);
				resolve(privateKey);
			} catch (error) {
				reject(error);
			}
		};

		request.onerror = () => reject(request.error);
	});
}

export async function getStoredPublicKey(
	userId: string,
): Promise<string | null> {
	await initializeDatabase();

	return new Promise((resolve, reject) => {
		if (!db) {
			reject(new Error("Database not initialized"));
			return;
		}

		const transaction = db.transaction([STORE_NAME], "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(userId);

		request.onsuccess = () => {
			const result = request.result as StoredKeyPair | undefined;
			resolve(result?.publicKeyPem || null);
		};

		request.onerror = () => reject(request.error);
	});
}

export async function hasKeyPair(userId: string): Promise<boolean> {
	const publicKey = await getStoredPublicKey(userId);
	return publicKey !== null;
}

export async function getPublicKeyForEncryption(
	publicKeyPem: string,
): Promise<CryptoKey> {
	const cached = publicKeyCache.get(publicKeyPem);
	if (cached) {
		return cached;
	}

	const publicKey = await importPublicKey(publicKeyPem);
	publicKeyCache.set(publicKeyPem, publicKey);
	return publicKey;
}

export function getPrivateKey(): CryptoKey | null {
	return privateKey;
}

export async function clearKeys(): Promise<void> {
	await initializeDatabase();

	privateKey = null;
	publicKeyCache.clear();

	return new Promise((resolve, reject) => {
		if (!db) {
			reject(new Error("Database not initialized"));
			return;
		}

		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.clear();

		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function deleteKeyPair(userId: string): Promise<void> {
	await initializeDatabase();

	return new Promise((resolve, reject) => {
		if (!db) {
			reject(new Error("Database not initialized"));
			return;
		}

		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete(userId);

		request.onsuccess = () => {
			if (privateKey) {
				privateKey = null;
			}
			resolve();
		};
		request.onerror = () => reject(request.error);
	});
}
