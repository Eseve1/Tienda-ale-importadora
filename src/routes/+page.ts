import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
	// PROTECCIÓN: Si parent() no trae nada, usamos un array vacío []
	const parentData = await parent();
	const allProducts = parentData.allProducts || [];

	const category = url.searchParams.get('category') || 'All Products';
	const filter = url.searchParams.get('filter') || 'newest';

	// Si no hay productos, devolvemos lista vacía y no explota
	if (!allProducts || allProducts.length === 0) {
		return { products: [], category, filter };
	}

	// 1. FILTRADO
	const filteredProducts = category === 'All Products'
		? allProducts
		: allProducts.filter((p) =>
			p.categories.some(c => c.toLowerCase() === category.toLowerCase())
		);

	// 2. ORDENAMIENTO
	const sortedProducts = [...filteredProducts].sort((a, b) => {
		switch (filter) {
			case 'lth': return a.price - b.price;
			case 'htl': return b.price - a.price;
			case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
			default: return 0;
		}
	});

	return {
		products: sortedProducts,
		category,
		filter
	};
};