<script lang="ts">
import { onMount } from 'svelte';
import { Client, Databases, Query } from 'appwrite';
import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';
import AnnouncementBar from '$lib/components/header/AnnouncementBar.svelte';
import Footer from '$lib/components/footer/Footer.svelte';

const ENDPOINT = "https://api.importadoraale.app/v1";
const PROJECT_ID = "6978d1bc000bad7c5671";
const DB_ID = "6978d1f3000ea0b56ebc";
const COLLECTION_ID = "catalogo_ale";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const db = new Databases(client);
let productos: any[] = [];
let loading = true;
let loadingMore = false;
let modalOpen = false;
let selectedProduct: any = null;
let activeImage = "";
let y = 0;
let searchTerm = "";
let catActual = "Todo";

const LIMIT = 50;
let offset = 0;
let hasMore = true;
let debounceTimer: any;
const categorias = ["Todo", "Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

function shuffleArray(array: any[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

async function cargarProductos(cat = "Todo", isSearch = false, loadMore = false) {
	if (loadMore) {
		loadingMore = true;
	} else {
		loading = true;
		offset = 0;
		hasMore = true;
		productos = [];
		catActual = cat;
	}

	try {
		// Modificar la lógica de filtrado para incluir validación de MOQ
		const queries: any[] = [
			Query.limit(LIMIT),
			Query.offset(offset),
			Query.orderDesc('$createdAt'),
			Query.greaterThan("precioUnidad", 0),
			Query.greaterThan("moq", 0) // Asegurarse de que el MOQ sea mayor a 0
		];

		if (searchTerm && searchTerm.trim().length > 0) {
			queries.push(
				Query.or([
					Query.contains("codigo", searchTerm),
					Query.contains("descripcion", searchTerm)
				])
			);
		}

		if (cat !== "Todo" && !isSearch) {
			queries.push(Query.equal("categoria", cat));
		}

		const res = await db.listDocuments(DB_ID, COLLECTION_ID, queries);
		console.log('Respuesta productos unidad:', res.documents);
		let nuevos = res.documents ?? [];

		if (!loadMore && !searchTerm) {
			nuevos = shuffleArray(nuevos);
		}

		nuevos = nuevos.sort((a, b) => {
			if (a.disponible === true && b.disponible !== true) return -1;
			if (a.disponible !== true && b.disponible === true) return 1;
			return 0;
		});

		productos = loadMore ? [...productos, ...nuevos] : nuevos;
		offset += nuevos.length;

		if (nuevos.length < LIMIT) {
			hasMore = false;
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading = false;
		loadingMore = false;
	}
}

function handleSearchInput() {
	clearTimeout(debounceTimer);
	loading = true;
	debounceTimer = setTimeout(() => {
		cargarProductos(catActual, true, false);
	}, 400);
}

function abrirModal(producto: any) {
	selectedProduct = producto;
	activeImage = producto.imagen;
	modalOpen = true;
	if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
}

function cerrarModal() {
	modalOpen = false;
	selectedProduct = null;
	activeImage = "";
	if (typeof document !== 'undefined') document.body.style.overflow = '';
}

function handleModalKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') cerrarModal();
}

onMount(async () => {
	await cargarProductos();
});
</script>

<svelte:head>
	<title>Ale Importadora | Precios por Unidad</title>
	<meta name="description" content="Descubre los precios por unidad en Ale Importadora. Encuentra productos únicos disponibles solo en tienda física." />
	<meta property="og:title" content="Ale Importadora | Precios por Unidad" />
	<meta property="og:description" content="Descubre los precios por unidad en Ale Importadora. Encuentra productos únicos disponibles solo en tienda física." />
	<meta property="og:image" content="https://importadoraale.app/og-image.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:title" content="Catálogo de Precios por Unidad" />
	<meta property="og:description" content="Descubre los mejores precios por unidad en nuestra tienda." />
	<meta property="og:url" content="https://importadoraale.app/" />
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="min-h-screen bg-[#fcfcfc] flex flex-col font-sans selection:bg-[#f7421e] selection:text-white">
	<AnnouncementBar />

	<header class="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm px-4 py-4">
		<div class="max-w-7xl mx-auto relative">
			<input
				type="text"
				name="search"
				id="search"
				autocomplete="off"
				aria-label="Buscar productos por nombre o código"
				bind:value={searchTerm}
				on:input={handleSearchInput}
				placeholder="Buscar por nombre o código..."
				class="w-full bg-[#f3f4f6] border-none rounded-full py-3 px-12 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f7421e] transition-all shadow-inner caret-[#f7421e]"
			/>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			{#if loading && searchTerm}
				<div class="absolute right-4 top-3.5 animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
			{/if}
		</div>
	</header>

	<nav class="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-[75px] z-[90] overflow-x-auto no-scrollbar py-3 mt-4">
		<div class="max-w-7xl mx-auto flex px-4 gap-2">
			{#each categorias as cat}
				<button
					on:click={() => { searchTerm = ""; cargarProductos(cat); }}
					class="whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-bold border transition-all {catActual === cat ? 'bg-[#f7421e] text-white border-[#f7421e] shadow-md shadow-orange-200' : 'bg-white text-gray-500 border-gray-100 hover:border-[#f7421e] hover:text-[#f7421e]'}"
				>
					{cat}
				</button>
			{/each}
		</div>
	</nav>

	<main class="max-w-7xl mx-auto w-full p-4 py-6 flex-1">
		{#if loading && !productos.length}
			<div class="flex justify-center py-24 text-gray-300 font-bold uppercase tracking-widest text-xs animate-pulse">Cargando catálogo...</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-5">
				{#each productos as product, i (product.$id)}
					<WholesaleCard
						{product}
						index={i}
						showUnitPrice={true}
						on:select={(e) => abrirModal(e.detail)}
					/>
				{/each}
			</div>

			{#if hasMore && !searchTerm && productos.length > 0}
				<div class="flex justify-center mt-12 mb-6">
					<button
						on:click={() => cargarProductos(catActual, false, true)}
						disabled={loadingMore}
						class="bg-white border-2 border-gray-100 text-gray-500 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:border-[#f7421e] hover:text-[#f7421e] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-3 group"
					>
						{#if loadingMore}
							<div class="animate-spin h-4 w-4 border-2 border-[#f7421e] border-t-transparent rounded-full"></div>
							Cargando...
						{:else}
							<span>Cargar más productos</span>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
						{/if}
					</button>
				</div>
			{/if}

			{#if productos.length === 0 && !loading}
				<div class="text-center py-20 text-gray-400 font-bold text-sm">No se encontraron productos.</div>
			{/if}
		{/if}
	</main>

	<!-- Modal Section: Unidad (solo imagen + 2 botones de ubicacion) -->
	{#if modalOpen && selectedProduct}
		<div
			role="button"
			tabindex="0"
			class="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
			on:click={cerrarModal}
			on:keydown={handleModalKeydown}
		>
			<div
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				class="w-full max-w-sm md:max-w-md mx-4 bg-white rounded-xl shadow-lg overflow-hidden relative"
				on:click|stopPropagation
				on:keydown|stopPropagation={() => {}}
			>
				<!-- Close button -->
				<button aria-label="Cerrar" class="absolute right-3 top-3 text-gray-500 hover:text-gray-700 z-20" on:click={cerrarModal}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<!-- Image -->
				<div class="w-full bg-gray-50 p-4 flex justify-center items-center">
					<img
						src={`${selectedProduct.imagen}&width=400&quality=80&output=webp&gravity=center`}
						alt={selectedProduct.descripcion}
						loading="lazy"
						class="w-full h-auto max-h-60 object-contain rounded-md"
						on:error={(event) => {
							const target = event.currentTarget;
							if (target instanceof HTMLImageElement) {
								target.src = '/static/images/fallback-image.webp';
							}
						}}
					/>
				</div>

				<!-- Buttons de ubicacion -->
				<div class="p-4 space-y-3">
					<p class="text-sm text-gray-600 text-center">Elige una sucursal para ver la ubicación:</p>
					<a href="https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Cañoto+Santa+Cruz" target="_blank" rel="noopener" class="block w-full text-center bg-[#1e40af] hover:bg-[#153e8a] text-white py-3 rounded-lg font-bold">Sucursal Cañoto</a>
					<a href="https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Los+Pozos+Santa+Cruz" target="_blank" rel="noopener" class="block w-full text-center bg-[#1e40af] hover:bg-[#153e8a] text-white py-3 rounded-lg font-bold">Sucursal Los Pozos</a>
				</div>
			</div>
		</div>
	{/if}

	<Footer />
</div>

<style>
	.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
