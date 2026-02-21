import { Client, Databases, Storage, Account } from 'appwrite';

// =========================================================
// 🦁 CONFIGURACIÓN SERVIDOR (BACKEND)
// =========================================================
const client = new Client();

client
	.setEndpoint('https://app.grupo59.com/v1') // ✅ TU DOMINIO SEGURO
	.setProject('6978d1bc000bad7c5671');              // ✅ TU ID NUEVO

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

// =========================================================
// 🦁 CONSTANTES
// =========================================================
export const APPWRITE_DATABASE_ID = '6978d1f3000ea0b56ebc';
export const APPWRITE_COLLECTION_ID = 'catalogo_ale';
export const APPWRITE_BUCKET_ID = '6978d7a5001a8a5c7c9e';
