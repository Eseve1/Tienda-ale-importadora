<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Databases, Query } from 'appwrite';
	import RetailCard from '$lib/components/grid/RetailCard.svelte';
	import AnnouncementBar from '$lib/components/header/AnnouncementBar.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';

	const ENDPOINT = "https://app.grupo59.com/v1";
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
	let y = 0;
	let searchTerm = "";
	let catActual = "Todo";

	const LIMIT = 50;
	let offset = 0;
	let hasMore = true;
	let debounceTimer: any;
	const categorias = ["Todo", "Belleza y salud", "Herramientas", "Hogar y cocina", "Infantil", "Moda y equipaje", "Oficina y escolar", "Tecnología"];

	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
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
			const queries: any[] = [
				Query.limit(LIMIT),
				Query.offset(offset),
				Query.orderDesc('$createdAt'),
				Query.greaterThan("precioUnidad", 0),
				Query.greaterThan("moq", 0)
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
			let nuevos = res.documents ?? [];
			productos = loadMore ? [...productos, ...nuevos] : nuevos;
			offset += nuevos.length;
			if (nuevos.length < LIMIT) hasMore = false;
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
		debounceTimer = setTimeout(() => cargarProductos(catActual, true, false), 400);
	}

	function abrirModal(producto: any) {
		selectedProduct = producto;
		modalOpen = true;
		if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
	}

	function cerrarModal() {
		modalOpen = false;
		selectedProduct = null;
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cerrarModal();
	}

	onMount(async () => await cargarProductos());
</script>

<svelte:window bind:scrollY={y} />

<div class="min-h-screen bg-[#fcfcfc] flex flex-col font-sans selection:bg-[#f7421e] selection:text-white">
	<AnnouncementBar />

	<header class="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm px-4 py-4">
		<div class="max-w-7xl mx-auto relative">
			<input
				type="text"
				bind:value={searchTerm}
				on:input={handleSearchInput}
				placeholder="Buscar por nombre o código..."
				class="w-full bg-[#f3f4f6] border-none rounded-full py-3 px-12 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#f7421e] transition-all shadow-inner"
			/>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
			<div class="flex justify-center py-24 text-gray-300 font-bold uppercase tracking-widest text-xs animate-pulse">Cargando...</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-5">
				{#each productos as product, i (product.$id)}
					<RetailCard {product} index={i} on:showLocations={(e) => abrirModal(e.detail)} />
				{/each}
			</div>

			<!-- BOTÓN CARGAR MÁS -->
			{#if hasMore && !loading}
				<div class="flex justify-center mt-10">
					<button
						on:click={() => cargarProductos(catActual, false, true)}
						disabled={loadingMore}
						class="px-8 py-3 bg-white border-2 border-[#FF6A00] text-[#FF6A00] font-bold rounded-full text-sm hover:bg-[#FF6A00] hover:text-white transition-all active:scale-95 disabled:opacity-50"
					>
						{loadingMore ? 'Cargando...' : 'Cargar más productos'}
					</button>
				</div>
			{/if}
		{/if}
	</main>

	<!-- MODAL -->
	{#if modalOpen && selectedProduct}
		<div
			role="button"
			tabindex="0"
			class="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
			on:click={cerrarModal}
			on:keydown={handleModalKeydown}
		>
			<div
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				class="w-full max-w-sm md:max-w-md bg-white rounded-t-[2rem] md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col"
				on:click|stopPropagation
				on:keydown={handleModalKeydown}
			>
				<button
					class="absolute right-4 top-4 bg-gray-100 text-gray-500 hover:bg-[#FF6A00] hover:text-white p-2 rounded-full z-20 transition-colors"
					on:click={cerrarModal}
					aria-label="Cerrar modal"
				>✕</button>

				<!-- Foto del modal corregida con fixUrl completo -->
				<div class="w-full bg-[#f8f8f8] p-6 flex justify-center items-center relative border-b border-gray-100">
					<div class="absolute top-4 left-4 z-10 bg-[#B12704] text-white text-[12px] font-black px-2 py-1 rounded shadow-sm">-20% DTO</div>
					<img
						src="{fixUrl(selectedProduct.imagen)}&width=500&height=500&quality=85&output=webp"
						alt={selectedProduct.descripcion}
						class="w-full h-auto max-h-64 object-contain mix-blend-multiply"
					/>
				</div>

				<div class="p-6 bg-white space-y-4">
					<div class="text-center mb-2">
						<h3 class="text-[#0F1111] font-bold text-lg leading-tight capitalize mb-1">{selectedProduct.descripcion.toLowerCase()}</h3>
						<div class="flex items-end justify-center gap-2 mb-3">
							<span class="text-gray-400 font-medium line-through text-sm mb-0.5">Bs. {Number(selectedProduct.precioUnidad).toFixed(2)}</span>
							<div class="flex items-start text-[#B12704]">
								<span class="text-[12px] font-bold pt-[3px] mr-[1px]">Bs.</span>
								<span class="text-3xl font-black leading-none tracking-tight">{(Number(selectedProduct.precioUnidad) * 0.8).toFixed(2).split('.')[0]}</span>
								<span class="text-[12px] font-bold pt-[2px]">.{(Number(selectedProduct.precioUnidad) * 0.8).toFixed(2).split('.')[1]}</span>
							</div>
						</div>
						<p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Disponible en:</p>
					</div>

					<a
						href="https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Cañoto+Santa+Cruz"
						target="_blank"
						rel="noopener"
						class="w-full border-2 border-gray-100 hover:border-[#FF6A00] hover:bg-[#FFF0E5] text-[#0F1111] p-3 rounded-xl flex items-center justify-between transition-all group"
					>
						<div class="flex flex-col text-left">
							<span class="font-bold text-sm">Sucursal Cañoto</span>
							<span class="text-[10px] text-gray-500">Ver en Google Maps</span>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 group-hover:text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>

					<a
						href="https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Los+Pozos+Santa+Cruz"
						target="_blank"
						rel="noopener"
						class="w-full border-2 border-gray-100 hover:border-[#FF6A00] hover:bg-[#FFF0E5] text-[#0F1111] p-3 rounded-xl flex items-center justify-between transition-all group"
					>
						<div class="flex flex-col text-left">
							<span class="font-bold text-sm">Sucursal Los Pozos</span>
							<span class="text-[10px] text-gray-500">Ver en Google Maps</span>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 group-hover:text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	{/if}

	<Footer />
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
</style>