import blurHashDatasetRaw from '$lib/blurhash.json';

const blurHashDataset: Record<string, string> = blurHashDatasetRaw;

export type Cart = {
	id: string;
	quantity: number;
	product: Product;
	features: Record<string, string>;
};

// --- AQUÍ ESTÁ EL CAMBIO PARA TUS 424 ORGANIZACIONES ---
export type Product = {
	slug: string;
	name: string;        // Se mapeará con 'descripcion'
	description: string; // Se mapeará con 'descripcion'
	images: string[];    // Se mapeará con 'imagen' e 'imagen2'
	imagesBlurHashes: string[];
	categories: string[]; // Se mapeará con 'categoria'
	price: number;       // Se mapeará con 'preciopormayor'
	precioUnidad?: number; // Campo extra para tu lógica
	codigo?: string;      // Campo extra para tu 'Ref'
	date: string;
	popularity: number;
	features?: ProductFeature[];
	metadata?: Record<string, unknown>;
	discount?: number;
};

export type ProductFeature = {
	name: string;
	variations: ProductVariation[];
	metadata?: Record<string, unknown>;
};

export type ProductVariation = {
	name: string;
	priceModifier?: (
		price: number,
		product: Product,
		variation: ProductVariation,
		feature: ProductFeature
	) => number;
	metadata?: Record<string, unknown>;
};

// Borramos la lista de productos estáticos (ropa)
// para que el sistema use solo tus datos de Appwrite.
export const products: Product[] = [];

/**
 * Mantiene la lógica de transición original del template
 */
export const isProductTransition = (
	currentPath: string | undefined,
	targetPath: string | undefined
): boolean => {
	const productGridRegex = /^\/$/;
	const productDetailsRegex = /^\/product-[\w-]+$/;

	return (
		(productGridRegex.test(currentPath ?? '') && productDetailsRegex.test(targetPath ?? '')) ||
		(productDetailsRegex.test(currentPath ?? '') && productGridRegex.test(targetPath ?? '')) ||
		(productDetailsRegex.test(currentPath ?? '') && productDetailsRegex.test(targetPath ?? ''))
	);
};