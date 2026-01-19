import { Client, Databases } from 'appwrite';

export const load = async ({ params }) => {
	const client = new Client()
		.setEndpoint('https://fra.cloud.appwrite.io/v1')
		.setProject('692ee6b70012153cd33c');

	const databases = new Databases(client);

	try {
		// Buscamos el documento directamente por su ID (que es el slug)
		const product = await databases.getDocument(
			'692ee774002e9a3c8601', // Database ID
			'catalogo',             // Collection ID
			params.slug             // ID del producto
		);

		return { product };
	} catch (error) {
		console.error("Producto no encontrado:", error);
		return { product: null }; // Si falla, mandamos null
	}
};