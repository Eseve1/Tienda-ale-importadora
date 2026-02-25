<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Databases, Query } from 'appwrite';
	import { goto } from '$app/navigation';

	import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';
	import CartSheet from '$lib/components/cart/CartSheet.svelte';
	import AnnouncementBar from '$lib/components/header/AnnouncementBar.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import { cart } from '$lib/stores/cart';

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
	let activeImage = "";
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
			const queries: any[] = [
				Query.limit(LIMIT),
				Query.offset(offset),
				Query.orderDesc('$createdAt')
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
		activeImage = fixUrl(producto.imagen);
		modalOpen = true;
		if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
	}

	function cerrarModal() {
		modalOpen = false;
		selectedProduct = null;
		activeImage = "";
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	}

	function addAndExit() {
		if (selectedProduct) {
			const priceType = selectedProduct.moq > 1 ? "mayorista" : "unidad";
			cart.add(selectedProduct, selectedProduct.moq || 12, priceType);
			cerrarModal();
		}
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cerrarModal();
	}

	onMount(async () => {
		await cargarProductos();

		const params = new URLSearchParams(window.location.search);
		const idShared = params.get('id');

		if (idShared) {
			const productoEncontrado = productos.find(p => p.$id === idShared);
			if (productoEncontrado) {
				abrirModal(productoEncontrado);
			}
		}
	});

	let showSelector = true;

	function elegirModo(modo: 'mayor' | 'unidad') {
		if (modo === 'mayor') {
			showSelector = false;
		} else {
			goto('/precios-unidad');
		}
	}
</script>

<svelte:head>
	<title>Ale Importadora | Catálogo Mayorista y Novedades en Santa Cruz</title>
	<meta name="description" content="Descubre el catálogo virtual de importación directa en Bolivia. Precios de fábrica en Hogar, Tecnología, Belleza y Juguetes. Abastece tu negocio hoy mismo." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Ale Importadora | Catálogo Mayorista en Bolivia" />
	<meta property="og:description" content="Precios de locura para revendedores. Mira el catálogo actualizado aquí." />
	<meta property="og:image" content="https://importadoraale.app/og-image.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Imagen destacada de Ale Importadora" />
	<link rel="canonical" href="https://importadoraale.app" />
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

	<div class="max-w-7xl mx-auto w-full px-4 mt-8">
		<div class="bg-[#f7421e] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-orange-200 border-2 border-white/10">
			<div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px;"></div>
			<div class="relative z-10">
				<span class="inline-block bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">Mayorista Oficial</span>
				<h1 class="text-3xl md:text-6xl font-black leading-none mb-3 tracking-tight font-poppins italic">IMPORTACIÓN DIRECTA</h1>
				<p class="text-white/80 text-sm md:text-base max-w-md">Precios especiales para tiendas y revendedores. Stock real en Santa Cruz.</p>
			</div>
		</div>
	</div>

	<nav class="max-w-7xl mx-auto w-full px-4 mt-6 no-scrollbar" style="overflow-x: auto;">
		<div class="flex gap-2 pb-1" style="width: max-content;">
			{#each categorias as cat}
				<button
					on:click={() => cargarProductos(cat)}
					class="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap {catActual === cat ? 'bg-[#f7421e] text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-500 border border-gray-100 hover:border-[#f7421e] hover:text-[#f7421e]'}"
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

	{#if y > 500}
		<button
			aria-label="Subir"
			on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			class="fixed bottom-24 right-4 h-12 w-12 md:h-14 md:w-14 bg-[#0085FF] text-white rounded-full shadow-2xl z-[350] border-2 border-white flex items-center justify-center animate-bounce hover:scale-110 transition-transform ring-2 ring-blue-100/50"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
			</svg>
		</button>
	{/if}

	<Footer />

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
				class="bg-white w-full max-w-4xl rounded-t-[2rem] md:rounded-[2.5rem] overflow-hidden relative flex flex-col md:flex-row shadow-2xl max-h-[95dvh] md:max-h-[90vh]"
				on:click|stopPropagation
				on:keydown|stopPropagation
			>
				<button class="absolute top-4 right-4 bg-gray-100 text-gray-400 p-2 rounded-full z-50 hover:bg-[#f7421e] hover:text-white" on:click={cerrarModal} aria-label="Cerrar">✕</button>

				<div class="w-full md:w-1/2 bg-[#f9f9f9] h-auto flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0 relative p-4">
					{#if !selectedProduct.disponible}
						<div class="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
							Agotado
						</div>
					{/if}

					<div class="w-full h-56 md:h-96 flex items-center justify-center mb-2 md:mb-4">
						<img
							src="{activeImage || fixUrl(selectedProduct.imagen)}&width=800&quality=85&output=webp"
							srcset="
							  {activeImage || fixUrl(selectedProduct.imagen)}&width=400&quality=85&output=webp 400w,
							  {activeImage || fixUrl(selectedProduct.imagen)}&width=800&quality=85&output=webp 800w
							"
							sizes="(max-width: 768px) 400px, 800px"
							alt={selectedProduct.descripcion}
							loading="lazy"
							on:error={(event) => {
								const target = event.target;
								if (target instanceof HTMLImageElement) {
									target.src = '/images/fallback-image.webp';
								}
							}}
							class="h-full w-full object-contain mix-blend-multiply { !selectedProduct.disponible ? 'grayscale opacity-50' : '' }"
						/>
					</div>

					{#if selectedProduct.imagen2}
						<div class="flex gap-2">
							<button
								on:click={() => activeImage = fixUrl(selectedProduct.imagen)}
								class="w-12 h-12 md:w-16 md:h-16 border-2 rounded-lg overflow-hidden transition-all {activeImage === fixUrl(selectedProduct.imagen) ? 'border-[#f7421e]' : 'border-transparent hover:border-gray-300'}"
							>
								<img src="{fixUrl(selectedProduct.imagen)}&width=100&quality=60&output=webp" class="w-full h-full object-cover" alt="Vista 1" />
							</button>
							<button
								on:click={() => activeImage = fixUrl(selectedProduct.imagen2)}
								class="w-12 h-12 md:w-16 md:h-16 border-2 rounded-lg overflow-hidden transition-all {activeImage === fixUrl(selectedProduct.imagen2) ? 'border-[#f7421e]' : 'border-transparent hover:border-gray-300'}"
							>
								<img src="{fixUrl(selectedProduct.imagen2)}&width=100&quality=60&output=webp" class="w-full h-full object-cover" alt="Vista 2" />
							</button>
						</div>
					{/if}
				</div>

				<div class="w-full md:w-1/2 p-4 md:p-12 flex flex-col overflow-y-auto">
					<span class="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-0.5 block">Ref: {selectedProduct.codigo}</span>

					<h2 class="text-lg md:text-2xl font-black text-[#222] leading-tight mb-3 capitalize font-poppins">{selectedProduct.descripcion.toLowerCase()}</h2>

					<div class="bg-white p-1 rounded-2xl mb-2 md:mb-6 flex flex-col justify-center relative">

						{#if selectedProduct.precioUnidad && selectedProduct.precioUnidad > selectedProduct.preciopormayor}
							<div class="flex flex-wrap items-center gap-2 mb-1">
								<span class="text-gray-400 text-[11px] font-bold line-through decoration-red-400/50">
									Precio Tienda: Bs. {Number(selectedProduct.precioUnidad).toFixed(2)}
								</span>
								<span class="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
									-{Math.round(((selectedProduct.precioUnidad - selectedProduct.preciopormayor) / selectedProduct.precioUnidad) * 100)}%
								</span>
							</div>
						{/if}

						<div class="flex items-baseline flex-wrap gap-x-1 mb-2">
							<span class="text-xl font-bold text-[#f7421e]">Bs.</span>
							<span class="text-4xl md:text-6xl font-black text-[#f7421e] tracking-tighter">
								{(Number(selectedProduct.preciopormayor) * (selectedProduct.moq || 12)).toFixed(2)}
							</span>
						</div>

						<div class="mt-2 bg-[#fff0ed] border border-[#f7421e]/20 rounded-xl p-3 md:p-4 flex items-center gap-3 w-full mb-3">
							<div class="bg-white p-2 rounded-full shrink-0 shadow-sm border border-orange-100">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-[#f7421e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div class="flex flex-col leading-tight">
								<span class="text-[#f7421e] font-black text-[11px] md:text-[13px] uppercase mb-1">
									Compra mínima: {selectedProduct.moq || 12} unidades
								</span>
								<span class="text-[#222] font-medium text-[12px] md:text-sm">
									Bs. {Number(selectedProduct.preciopormayor).toFixed(2)} cada unidad.
								</span>
							</div>
						</div>
					</div>

					{#if selectedProduct.disponible}
						<button
							on:click={addAndExit}
							class="w-full bg-[#f7421e] hover:bg-[#d12e0e] text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.1em] shadow-lg shadow-orange-500/30 active:scale-95 transition-all mb-2 md:mb-4"
						>
							AÑADIR AL PEDIDO
						</button>
					{:else}
						<button
							disabled
							class="w-full bg-gray-200 text-gray-400 py-4 md:py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.1em] mb-2 md:mb-4 cursor-not-allowed"
						>
							Producto Agotado
						</button>
					{/if}

					{#if selectedProduct.precioUnidad}
						<div class="border-t border-gray-100 pt-2 md:pt-5 mt-auto">
						</div>
					{/if}

				</div>
			</div>
		</div>
	{/if}

	{#if showSelector}
		<div class="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
			<div class="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-xs w-full">
				<h2 class="text-xl font-black text-[#f7421e] mb-2 text-center">¿Cómo quieres ver los precios?</h2>
				<button class="w-full bg-[#f7421e] text-white font-bold py-3 rounded-xl text-lg mb-2 hover:bg-[#d12e0e] transition-all" on:click={() => elegirModo('mayor')}>Precios por Mayor</button>
				<button class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-lg hover:bg-blue-800 transition-all" on:click={() => elegirModo('unidad')}>Precios por Unidad</button>
			</div>
		</div>
	{/if}

	<CartSheet />
</div>

<style>
    .no-scrollbar::-webkit-scrollbar { display: none; }
</style>