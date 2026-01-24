import { Client, Databases, Query } from 'appwrite';

// 1. CONFIGURACIÓN (Blindada para el build)
const PROJECT_ID = "692ee6b70012153cd33c";
const DATABASE_ID = "692ee774002e9a3c8601";
const COLLECTION_ID = "catalogo";

// Definimos las categorías aquí para evitar el error "Cannot find module '$lib/store'"
const categoriasSitemap = [
	"Belleza y salud", "Herramientas", "Hogar y cocina",
	"Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"
];

const client = new Client()
	.setEndpoint("https://cloud.appwrite.io/v1")
	.setProject(PROJECT_ID);
const databases = new Databases(client);

let sitemapCache: string | null = null;
let lastCache = 0;

export async function GET({ url }) {
	// Optimización: Caché de 15 min para no quemar lecturas en cada rastreo
	if (sitemapCache && Date.now() - lastCache < 15 * 60 * 1000) {
		return new Response(sitemapCache, {
			headers: { 'Content-Type': 'application/xml' }
		});
	}

	let products: any[] = [];
	try {
		// Optimización Ebenezer Don: Solo pedimos el ID (reducción de carga)
		const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.limit(1000)
		]);
		products = response.documents;
	} catch (err) {
		console.error('Sitemap fetch error:', err);
	}

	const pages = [
		'', // home
		...categoriasSitemap.map(c => `category/${encodeURIComponent(c)}`),
		...products.map(p => `product-${p.$id}`)
	];

	const body = generateXML(url.origin, pages);
	sitemapCache = body;
	lastCache = Date.now();

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=0, s-maxage=86400'
		}
	});
}

function generateXML(origin: string, pages: string[]) {
	const urls = pages.map(p => {
		const loc = p ? `${origin}/${p}` : `${origin}/`;
		return `  <url>
    <loc>${loc}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.5'}</priority>
  </url>`;
	}).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}