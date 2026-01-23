import { Client, Databases, Query } from 'appwrite';
import { categories, filterOptions } from '../store';

// TUS DATOS DE APPWRITE
const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '692ee6b70012153cd33c';
const DATABASE_ID = '692ee774002e9a3c8601';
const COLLECTION_ID = 'catalogo';

export async function GET({ url }) {
	let products: any[] = [];

	try {
		const client = new Client()
			.setEndpoint(ENDPOINT)
			.setProject(PROJECT_ID);

		const databases = new Databases(client);

		// Traemos hasta 1000 productos para cubrir todo tu inventario
		const response = await databases.listDocuments(
			DATABASE_ID,
			COLLECTION_ID,
			[Query.limit(1000)]
		);

		products = response.documents;
		console.log(`🦁 Sitemap: Actualizado. ${products.length} productos listados.`);
	} catch (error) {
		console.error("❌ Error en Sitemap:", error);
	}

	const body = sitemap(url, websitePages(products));
	const response = new Response(body);
	response.headers.set('Content-Type', 'application/xml');
	// CACHÉ DE 24 HORAS (86400 segundos) PARA AHORRAR RECURSOS
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
	return response;
}

const websitePages = (products: any[]) => {
	const productPages = products.map((product) => `product-${product.slug || product.$id}`);

	const encodedFilters = filterOptions.map(
		(filter) => `?filter=${encodeURIComponent(filter.value)}`
	);

	const encodedCategories = categories.map(
		(category) => `?category=${encodeURIComponent(category)}`
	);

	const paginatedPages = [];
	const totalPages = Math.ceil(products.length / 12) || 1;

	for (let page = 1; page <= totalPages; page++) {
		paginatedPages.push(`?page=${page}`);
	}

	return ['', ...paginatedPages, ...encodedCategories, ...encodedFilters, ...productPages];
};

const sitemap = (url: URL, pages: string[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
>
  ${pages
	.map(
		(page) => `
  <url>
    <loc>${url.origin}/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
  `
	)
	.join('')}
</urlset>`;