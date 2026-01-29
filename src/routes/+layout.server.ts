import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID } from '$lib/appwrite';
import { Query } from 'appwrite';

export const load = async () => {
	try {
		const response = await databases.listDocuments(
			APPWRITE_DATABASE_ID,
			APPWRITE_COLLECTION_ID,
			[Query.limit(50), Query.orderDesc('$createdAt')]
		);

		const allProducts = response.documents.map((doc) => ({
			$id: doc.$id,
			descripcion: doc.descripcion || 'Producto',
			imagen: doc.imagen,
			imagen2: doc.imagen2,
			categoria: doc.categoria || 'General',
			preciopormayor: Number(doc.preciopormayor) || 0,
			precioUnidad: Number(doc.precioUnidad) || 0,
			codigo: doc.codigo || 'S/R',
			moq: Number(doc.moq) || 3
		}));

		return { allProducts };
	} catch (error) {
		console.error('Error en carga:', error);
		return { allProducts: [] };
	}
};