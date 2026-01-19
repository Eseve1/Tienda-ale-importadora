import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID } from '$lib/appwrite';
import { Query } from 'appwrite';

export const load = async () => {
	try {
		const response = await databases.listDocuments(
			APPWRITE_DATABASE_ID,
			APPWRITE_COLLECTION_ID,
			[Query.limit(5000), Query.orderDesc('$createdAt')]
		);

		const allProducts = response.documents.map((doc) => ({
			slug: doc.$id,
			name: doc.descripcion || 'Producto sin nombre',
			images: [doc.imagen, doc.imagen2].filter(Boolean),
			category: doc.categoria || 'General',
			price: Number(doc.preciopormayor) || 0,
			precioUnidad: Number(doc.precioUnidad) || 0, // Aquí se asegura que exista
			codigo: doc.codigo || 'S/R',
			moq: Number(doc.moq) || 12
		}));

		return { allProducts };
	} catch (error) {
		console.error('Error en carga:', error);
		return { allProducts: [] }; // Fallback para evitar el error 500
	}
};