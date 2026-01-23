import { Client, Databases, Query } from 'appwrite'; // 👈 Importamos 'Client' aquí
import { categories, filterOptions } from '../store';

// 🦁 TUS DATOS DE APPWRITE (Configuración Manual Directa)
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '692ee6b70012153cd33c';
const DATABASE_ID = '692ee774002e9a3c8601';
const COLLECTION_ID = 'catalogo';

export async function GET({ url }) {
	let products: any[] = [];

	try {
		// 🛠️ CREAMOS LA CONEXIÓN AQUÍ MISMO (Para que no falle en el servidor)
		const client = new Client()
			.setEndpoint(ENDPOINT)
			.setProject(PROJECT_ID);

		const databases = new Databases(client);

		// Pedimos los productos
		const response = await databases.listDocuments(
			DATABASE_ID,
			COLLECTION_ID,
			[Query.limit(1000)]
		);

		products = response.documents;
		console.log(`🦁 Sitemap: ÉXITO. Encontrados ${products.length} productos.`);
	} catch (error) {
		console.error("❌ Error CRÍTICO en Sitemap:", error);
		// Si falla, seguimos con la lista vacía para no tumbar la web
	}

	const body = sitemap(url, websitePages(products));
	const response = new Response(body);
	response.headers.set('Content-Type', 'application/xml');
	response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
	return response;
}

const websitePages = (products: any[]) => {
	// Generamos los links: "product-slug"
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