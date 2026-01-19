import { Client, Account, Databases, Functions, Storage } from 'appwrite';

const client = new Client()
	.setEndpoint('https://fra.cloud.appwrite.io/v1') // Usamos el endpoint de tu código
	.setProject('692ee6b70012153cd33c');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export const APPWRITE_DATABASE_ID = '692ee774002e9a3c8601';
export const APPWRITE_COLLECTION_ID = 'catalogo'; // Tu código dice 'catalogo'
export const APPWRITE_BUCKET_ID = '692ef19e001ffa75d062';