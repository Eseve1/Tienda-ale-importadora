import { page } from '$app/stores';
import { derived } from 'svelte/store';

// Tus categorías exactas de Appwrite
export const categories = [
	'All Products',
	'Belleza y salud',
	'Herramientas',
	'Hogar y cocina',
	'Infantil',
	'Moda y equipaje',
	'Oficina y escolar',
	'Tecnología'
];

export const title = 'Catálogo Mayorista';
export const description = 'Catálogo de Ale Importadora - Envíos a todo el país';
export const name = 'Ale Importadora';

export const filterOptions = [
	{ value: 'newest', label: 'Novedades' },
	{ value: 'lth', label: 'Precio: Menor a Mayor' },
	{ value: 'htl', label: 'Precio: Mayor a Menor' }
];

export const selectedCategory = derived(
	page,
	($page) => $page.url.searchParams.get('category') || 'All Products'
);

export const currentPage = derived(
	page,
	($page) => Number($page.url.searchParams.get('page')) || 1
);

export const showSiteHeaders = derived(
	page,
	($page) => $page.route.id?.trim() === '/' && !$page.error
);