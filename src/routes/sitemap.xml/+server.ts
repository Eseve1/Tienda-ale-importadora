import { Client, Databases, Query } from 'appwrite';

const ENDPOINT = "https://api.importadoraale.app/v1";
const PROJECT_ID = "6978d1bc000bad7c5671";
const DATABASE_ID = "6978d1f3000ea0b56ebc";
const COLLECTION_ID = "catalogo_ale";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const databases = new Databases(client);

export async function GET({ url }) {
	let products: any[] = [];
	try {
		const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.limit(1000),
			Query.select(['$id', '$updatedAt'])
		]);
		products = response.documents;
	} catch (err) {
		console.error('Error Sitemap:', err);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url.origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products.map(p => `
  <url>
    <loc>${url.origin}/?id=${p.$id}</loc>
    <lastmod>${new Date(p.$updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`.trim();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
		}
	});
}