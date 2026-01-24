import { Client, Databases, Query } from 'appwrite';
import { categories } from '$lib/store';

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

		// 🔥 SOLO SLUG / ID – NADA MÁS
		const response = await databases.listDocuments(
			DATABASE_ID,
			COLLECTION_ID,
			[
				Query.limit(1000),
				Query.select(['slug', '$id'])
			]
		);

		products = response.documents;
		console.log(`Sitemap OK → ${products.length} productos`);
	} catch (err) {
		console.error('Sitemap error', err);
	}

	const pages = buildPages(products);
	const body = sitemap(url.origin, pages);

	const response = new Response(body);
	response.headers.set('Content-Type', 'application/xml');

	// 🧱 CACHE AGRESIVO (clave para frenar lecturas)
	response.headers.set(
		'Cache-Control',
		'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600'
	);

	return response;
}

function buildPages(products: any[]) {
	return [
		'', // home
		...categories.map(c => `category/${encodeURIComponent(c)}`),
		...products.map(p => `product/${p.slug || p.$id}`)
	];
}

function sitemap(origin: string, pages: string[]) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${pages
		.map(
			(p) => `
	<url>
		<loc>${origin}/${p}</loc>
		<changefreq>daily</changefreq>
		<priority>0.5</priority>
	</url>`
		)
		.join('')}
</urlset>`;
}
