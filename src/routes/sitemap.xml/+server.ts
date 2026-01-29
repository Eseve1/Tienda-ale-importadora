import { Client, Databases, Query } from 'appwrite';

// --- CREDENCIALES ---
const ENDPOINT = "https://api.importadoraale.app/v1";
const PROJECT_ID = "6978d1bc000bad7c5671";
const DATABASE_ID = "6978d1f3000ea0b56ebc";
const COLLECTION_ID = "catalogo_ale";

const categoriasSitemap = [
	"Belleza y salud", "Herramientas", "Hogar y cocina",
	"Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"
];

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

// ESCUDO DE CACHÉ
let sitemapCache: string | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Horas

export async function GET({ url }) {
	if (sitemapCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
		return new Response(sitemapCache, {
			headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' }
		});
	}

	let products: any[] = [];
	try {
		const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.equal("disponible", true),
			Query.limit(5000),
			Query.select(['$id', '$updatedAt'])
		]);
		products = response.documents;
	} catch (err) {
		console.error('Error Sitemap:', err);
	}

	const pages = [
		'',
		...categoriasSitemap.map(c => `?category=${encodeURIComponent(c)}`),
		...products.map(p => `?id=${p.$id}`)
	];

	const body = generateXML(url.origin, pages, products);
	sitemapCache = body;
	lastCacheTime = Date.now();

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400'
		}
	});
}

function generateXML(origin: string, pages: string[], products: any[]) {
	const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
	const urls = pages.map(p => {
		const loc = p ? `${cleanOrigin}/${p}` : `${cleanOrigin}/`;
		let lastmod = '';
		if (p.startsWith('?id=')) {
			const prodId = p.split('=')[1];
			const prod = products.find(item => item.$id === prodId);
			if (prod) lastmod = `\n    <lastmod>${new Date(prod.$updatedAt).toISOString()}</lastmod>`;
		}
		return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${p === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p === '' ? '1.0' : '0.6'}</priority>
  </url>`;
	}).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`.trim();
}