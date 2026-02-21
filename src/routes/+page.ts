import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
	const parentData = await parent();
	const allProducts = parentData.allProducts || [];

	const category = url.searchParams.get('category') || 'All Products';
	const filter = url.searchParams.get('filter') || 'newest';

	if (!allProducts || allProducts.length === 0) {
		return { products: [], category, filter };
	}

	// 1. FILTRADO (Corregido a 'categoria')
	const filteredProducts = category === 'All Products'
		? allProducts
		// @ts-ignore
		: allProducts.filter((p) => p.categoria && p.categoria.toLowerCase() === category.toLowerCase());

	// 2. ORDENAMIENTO (Corregido a 'preciopormayor')
	const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
		const priceA = parseFloat(a.preciopormayor || 0);
		const priceB = parseFloat(b.preciopormayor || 0);

		switch (filter) {
			case 'lth': return priceA - priceB;
			case 'htl': return priceB - priceA;
			case 'newest': return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
			default: return 0;
		}
	});

	return { products: sortedProducts, category, filter };
};
