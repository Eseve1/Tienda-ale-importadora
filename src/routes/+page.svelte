<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { Client, Databases, Query } from 'appwrite';
	import { cart } from '$lib/stores/cart';
	import { fixUrl } from '$lib/utils';
	import WholesaleCard from '$lib/components/grid/WholesaleCard.svelte';
	import CartSheet from '$lib/components/cart/CartSheet.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';

	const ENDPOINT = "https://app.grupo59.com/v1";
	const PROJECT_ID = "6978d1bc000bad7c5671";
	const DB_ID = "6978d1f3000ea0b56ebc";
	const COLLECTION_ID = "catalogo_ale";

	const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
	const db = new Databases(client);

	interface Product {
		$id: string;
		descripcion: string;
		preciopormayor: number;
		imagen: string;
		disponible: boolean;
		moq: number;
		codigo?: string;
		categoria?: string;
	}

	let productos: Product[] = [];
	let loading = true;
	let loadingMore = false;
	let searchTerm = "";
	let offset = 0;
	let hasMore = true;
	let lastCursor: string | null = null;

	let catActual = "Todo";
	const categorias = [
		{ label: "Todo", icon: "🗂️" },
		{ label: "Belleza y salud", icon: "💄" },
		{ label: "Herramientas", icon: "🔧" },
		{ label: "Hogar y cocina", icon: "🏠" },
		{ label: "Infantil", icon: "🧸" },
		{ label: "Moda y equipaje", icon: "👜" },
		{ label: "Oficina y escolar", icon: "📚" },
		{ label: "Tecnología", icon: "📱" },
	];

	let modalOpen = false;
	let selectedProduct: Product | null = null;
	let activeImage = "";
	let y = 0;
	let toastVisible = false;
	let toastTimer: any;

	const LIMIT = 50;


	// Shuffle Fisher-Yates — varía productos en cada visita
	function shuffleArray<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	async function cargarProductos(isSearch = false, loadMore = false) {
		if (loadMore) { loadingMore = true; }
		else { loading = true; offset = 0; hasMore = true; productos = []; lastCursor = null; }

		try {
			const queries: any[] = [
				Query.limit(LIMIT),
				Query.orderDesc('$createdAt'),
				Query.select(['$id','descripcion','preciopormayor','precioUnidad','imagen','disponible','moq','codigo','categoria']),
			];
			if (loadMore && lastCursor) {
				queries.push(Query.cursorAfter(lastCursor));
			}

			if (searchTerm?.trim().length > 0) {
				queries.push(Query.or([Query.contains("codigo", searchTerm), Query.contains("descripcion", searchTerm)]));
			} else if (catActual !== 'Todo') {
				queries.push(Query.equal("categoria", catActual));
			}

			const res = await db.listDocuments(DB_ID, COLLECTION_ID, queries);
			let nuevos = (res.documents ?? []) as unknown as Product[];
			// Guardar cursor ANTES del shuffle (Appwrite necesita orden original)
			if (nuevos.length > 0) lastCursor = nuevos[nuevos.length - 1].$id;
			nuevos = shuffleArray(nuevos);
			nuevos = nuevos.sort((a, b) => (a.disponible === b.disponible ? 0 : a.disponible ? -1 : 1));

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

	let debounceTimer: ReturnType<typeof setTimeout>;
	function ejecutarBusqueda() {
		cargarProductos(true, false);
	}
	function onSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (searchTerm.trim().length > 1 || searchTerm.trim().length === 0) {
				cargarProductos(true, false);
			}
		}, 350);
	}

	function seleccionarCategoria(cat: string) {
		catActual = cat;
		searchTerm = "";
		cargarProductos();
	}

	onMount(() => { cargarProductos(); });


	function abrirModal(producto: any) {
		selectedProduct = producto;
		activeImage = fixUrl(producto.imagen);
		modalOpen = true;
		if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
	}

	function cerrarModal() {
		modalOpen = false;
		selectedProduct = null;
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	}

	function addAndExit() {
		if (selectedProduct) {
			cart.add(selectedProduct, selectedProduct.moq || 12, "mayorista");
			cerrarModal();
			clearTimeout(toastTimer);
			toastVisible = true;
			toastTimer = setTimeout(() => toastVisible = false, 2400);
		}
	}
</script>

<svelte:head>
	<title>Ale Importadora | Catálogo Mayorista</title>
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="page-wrap">

	<div class="alibaba-header">
		<div class="search-wrapper">
			<input
				type="text"
				bind:value={searchTerm}
				on:keydown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
				on:input={onSearchInput}
				placeholder="Buscar productos, cajas, herramientas..."
				class="alibaba-search-input"
			/>
			<button on:click={ejecutarBusqueda} class="alibaba-search-btn" aria-label="Buscar">
				<svg class="search-btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
				<span class="search-btn-text">Buscar</span>
			</button>
		</div>

		<div class="wholesale-banner">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span><strong>Atención Mayoristas:</strong> Los precios mostrados aplican por cantidad mínima de compra (Generalmente 12 unidades surtidas o según indique el producto).</span>
		</div>
	</div>

	<nav class="cat-mobile">
		{#each categorias as cat}
			<button on:click={() => seleccionarCategoria(cat.label)} class="cat-chip {catActual === cat.label ? 'cat-chip-active' : ''}">
				<span class="chip-icon">{cat.icon}</span>{cat.label}
			</button>
		{/each}
	</nav>

	<div class="catalog-layout">
		<aside class="cat-sidebar">
			<p class="sidebar-title">Categorías</p>
			{#each categorias as cat}
				<button
					on:click={() => seleccionarCategoria(cat.label)}
					class="sidebar-item {catActual === cat.label ? 'sidebar-item-active' : ''}"
				>
					<span class="sidebar-icon">{cat.icon}</span>
					<span class="sidebar-label">{cat.label}</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="sidebar-arrow">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
					</svg>
				</button>
			{/each}

			<div class="sidebar-contact">
				<p class="sidebar-contact-title">¿Necesitas ayuda B2B?</p>
				<a href="https://wa.me/59161333335" target="_blank" rel="noopener" class="sidebar-wa-btn">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
					</svg>
					Contactar a un agente
				</a>
			</div>
		</aside>

		<main class="catalog-main">
			{#if loading && !productos.length}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<span>Cargando catálogo mayorista...</span>
				</div>
			{:else if productos.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
					<p>Sin resultados para <strong>"{searchTerm}"</strong></p>
				</div>
			{:else}
				<div class="results-bar">
					<span class="results-count">{productos.length}{hasMore ? '+' : ''} productos encontrados</span>
					{#if catActual !== 'Todo'}
						<span class="results-cat">en la categoría {catActual}</span>
					{/if}
				</div>

				<div class="products-grid">
					{#each productos as product, i (product.$id)}
						<WholesaleCard {product} index={i} on:select={(e) => abrirModal(e.detail)} />
					{/each}
				</div>
			{/if}
		</main>
	</div>

	{#if hasMore && productos.length > 0}
		<div class="load-more-wrap">
			<button on:click={() => cargarProductos(false, true)} class="load-more-btn" disabled={loadingMore}>
				{loadingMore ? 'Cargando más...' : 'Cargar más productos'}
			</button>
		</div>
	{/if}

	{#if y > 600}
		<button on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })} class="scroll-top-btn" aria-label="Volver arriba" transition:fly={{ y: 10, duration: 180 }}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
		</button>
	{/if}

	<Footer />

	{#if toastVisible}
		<div class="toast-added" transition:fly={{ y: 16, duration: 220 }}>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
			¡Cantidad agregada al pedido!
		</div>
	{/if}

	{#if modalOpen && selectedProduct}
		<div class="modal-backdrop" on:click={cerrarModal} on:keydown={(e) => e.key === 'Escape' && cerrarModal()} role="dialog" aria-modal="true" tabindex="-1" transition:fade={{ duration: 180 }}>
			<div class="modal-card" on:click|stopPropagation on:keydown={() => {}} role="document" transition:fly={{ y: 24, duration: 220 }}>

				<button class="modal-close" on:click={cerrarModal} aria-label="Cerrar">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>

				<div class="modal-body">

					<div class="modal-left">
						{#if !selectedProduct.disponible}
							<div class="modal-agotado-overlay">
								<span>AGOTADO</span>
							</div>
						{/if}
						<div class="modal-img-frame">
							<img src="{activeImage}&width=600&quality=85&output=webp" alt={selectedProduct.descripcion} class="modal-img" />
						</div>
					</div>

					<div class="modal-right">

						<div class="modal-header-info">
							<div class="modal-badges-row">
								{#if selectedProduct.codigo}
									<span class="modal-ref">REF: {selectedProduct.codigo}</span>
								{/if}
								{#if selectedProduct.categoria}
									<span class="modal-cat-badge">{selectedProduct.categoria}</span>
								{/if}
							</div>
							<h2 class="modal-title">{selectedProduct.descripcion.toLowerCase()}</h2>
						</div>

						<div class="vol-section">
							<p class="vol-label">PRECIO POR MAYOR</p>
							<div class="vol-table">
								<div class="vol-row vol-row-highlight">
									<div class="vol-qty">
										<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
										Mín. {selectedProduct.moq || 12} unid.
									</div>
									<div class="vol-price">
										<span class="vol-bs">Bs.</span>
										<span class="vol-amount">{Number(selectedProduct.preciopormayor).toFixed(2)}</span>
										<span class="vol-per">c/u</span>
									</div>
								</div>
							</div>
						</div>

						<div class="modal-total-block">
							<div class="modal-total-info">
								<span class="modal-total-label">Total estimado (por {selectedProduct.moq || 12} unidades)</span>
								<div class="modal-total-price">
									<span class="modal-total-bs">Bs.</span>
									<span class="modal-total-amount">{(Number(selectedProduct.preciopormayor) * (selectedProduct.moq || 12)).toFixed(2)}</span>
								</div>
							</div>
						</div>

						<div class="modal-features">
							<div class="feature-item">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
								Precio de importador
							</div>
							<div class="feature-item">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
								Venta directa
							</div>
							<div class="feature-item">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
								Despacho a todo el país
							</div>
						</div>

						{#if selectedProduct.disponible}
							<button on:click={addAndExit} class="modal-add-btn">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
								Añadir al pedido
							</button>
						{:else}
							<div class="modal-agotado-btn">Producto agotado en almacén</div>
						{/if}

					</div>
				</div>
			</div>
		</div>
	{/if}

	<CartSheet />

</div>

<style>
    .page-wrap {
        min-height: 100vh;
        background: #f0f2f5;
        display: flex;
        flex-direction: column;
    }

    .alibaba-header {
        background: #fff;
        padding: 16px 16px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 1px solid #eaeaea;
    }
    @media (min-width: 600px) {
        .alibaba-header { padding: 24px 20px 16px; }
    }

    .search-wrapper {
        display: flex;
        width: 100%;
        max-width: 800px;
        border: 2px solid #D93518;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 12px;
    }
    @media (min-width: 600px) {
        .search-wrapper { margin-bottom: 16px; }
    }

    .alibaba-search-input {
        flex: 1;
        padding: 12px 14px;
        border: none;
        outline: none;
        font-size: 14px;
        min-width: 0;
    }
    @media (min-width: 600px) {
        .alibaba-search-input { padding: 14px 20px; font-size: 15px; }
    }

    .alibaba-search-btn {
        background: #D93518;
        color: #fff;
        border: none;
        padding: 0 14px;
        font-weight: 800;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-shrink: 0;
    }
    @media (min-width: 600px) {
        .alibaba-search-btn { padding: 0 32px; }
    }
    .alibaba-search-btn:hover { background: #BA2D14; }

    /* En mobile solo ícono, en desktop texto + ícono */
    .search-btn-icon { display: block; }
    .search-btn-text { display: none; }
    @media (min-width: 600px) {
        .search-btn-icon { display: none; }
        .search-btn-text { display: block; }
    }

    .wholesale-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #FCF0ED;
        color: #b02a12;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 11.5px;
        max-width: 800px;
        width: 100%;
        box-sizing: border-box;
        line-height: 1.5;
    }
    @media (min-width: 600px) {
        .wholesale-banner { font-size: 12.5px; align-items: center; }
    }
    .wholesale-banner svg { flex-shrink: 0; margin-top: 1px; }

    .cat-mobile {
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        padding: 10px 12px;
        gap: 8px;
        background: #fff;
        border-bottom: 1px solid #eaeaea;
        align-items: center;
    }
    .cat-mobile::-webkit-scrollbar { display: none; }
    @media (min-width: 900px) { .cat-mobile { display: none; } }

    .cat-chip {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 7px 11px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #eaeaea;
        background: #fafafa;
        color: #444;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
    }
    .chip-icon { font-size: 13px; opacity: 0.8; }
    .cat-chip:hover { background: #fff; border-color: #ccc; }
    .cat-chip-active { background: #FCF0ED; color: #D93518; border-color: #D93518; font-weight: 700; }

    .catalog-layout {
        width: 100%;
        max-width: 1536px;
        margin: 0 auto;
        padding: 12px 10px 16px;
        display: flex;
        gap: 24px;
        align-items: flex-start;
        box-sizing: border-box;
        flex: 1;
    }
    @media (min-width: 600px) {
        .catalog-layout { padding: 20px 16px 20px; }
    }
    @media (min-width: 900px) {
        .catalog-layout { padding: 24px 24px 20px; }
    }

    .cat-sidebar { display: none; }
    @media (min-width: 900px) {
        .cat-sidebar {
            display: flex;
            flex-direction: column;
            width: 220px;
            min-width: 220px;
            flex-shrink: 0;
            position: sticky;
            top: 120px;
            align-self: flex-start;
            background: #fff;
            border-radius: 12px;
            border: 1px solid #eaeaea;
            padding: 16px 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
    }

    .sidebar-title {
        font-size: 14px;
        font-weight: 800;
        color: #111;
        padding: 0 10px;
        margin-bottom: 12px;
    }

    .sidebar-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 10px;
        margin-bottom: 2px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #555;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
        border-left: 3px solid transparent;
    }
    .sidebar-icon { font-size: 15px; flex-shrink: 0; opacity: 0.7; }
    .sidebar-label { flex: 1; text-align: left; }
    .sidebar-arrow { opacity: 0; transition: opacity 0.2s; color: #ccc; }

    .sidebar-item:hover { color: #D93518; background: #fafafa; }
    .sidebar-item-active {
        color: #D93518;
        font-weight: 700;
        background: #FCF0ED;
        border-left: 3px solid #D93518;
        border-radius: 4px 6px 6px 4px;
    }
    .sidebar-item-active .sidebar-icon { opacity: 1; }
    .sidebar-item-active .sidebar-arrow { opacity: 1; color: #D93518; }

    .sidebar-contact {
        margin-top: 24px;
        padding: 14px 12px;
        background: #fafafa;
        border-radius: 8px;
        border: 1px dashed #dcdcdc;
    }
    .sidebar-contact-title { font-size: 11.5px; font-weight: 700; color: #555; margin: 0 0 10px; text-align: center; }
    .sidebar-wa-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff;
        color: #25D366;
        border: 1px solid #25D366;
        padding: 8px 12px;
        border-radius: 6px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
        transition: all 0.15s;
        width: 100%;
        box-sizing: border-box;
        justify-content: center;
    }
    .sidebar-wa-btn:hover { background: #25D366; color: #fff; }

    .catalog-main { flex: 1; min-width: 0; }

    .results-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
    }
    .results-count { font-size: 12px; font-weight: 700; color: #888; }
    .results-cat { font-size: 12px; color: #bbb; }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
    @media (min-width: 500px) { .products-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; } }
    @media (min-width: 900px) { .products-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; } }
    @media (min-width: 1200px) { .products-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; } }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        padding: 80px 20px;
        color: #bbb;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.05em;
    }
    .loading-spinner {
        width: 32px; height: 32px;
        border: 3px solid #f0f0f0;
        border-top-color: #D93518;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 80px 20px;
        color: #ccc;
        text-align: center;
    }
    .empty-state p { font-size: 14px; color: #999; margin: 0; }

    .load-more-wrap {
        display: flex;
        justify-content: center;
        padding-bottom: 40px;
        width: 100%;
    }
    .load-more-btn {
        background: #fff;
        border: 1px solid #e0e0e0;
        color: #555;
        padding: 12px 40px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    .load-more-btn:hover { border-color: #D93518; color: #D93518; background: #FCF0ED; }
    .load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .scroll-top-btn {
        position: fixed;
        bottom: 80px; right: 16px;
        width: 40px; height: 40px;
        background: #fff;
        border: 1.5px solid #e0e0e0;
        color: #555;
        border-radius: 50%;
        display: flex;
        align-items: center; justify-content: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        z-index: 300;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
    }
    @media (min-width: 600px) {
        .scroll-top-btn { bottom: 90px; right: 20px; width: 44px; height: 44px; }
    }
    .scroll-top-btn:hover { border-color: #D93518; color: #D93518; }

    .toast-added {
        position: fixed;
        bottom: 80px; left: 50%;
        transform: translateX(-50%);
        background: #111;
        color: #fff;
        padding: 10px 18px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        z-index: 600;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 7px;
    }
    @media (min-width: 600px) {
        .toast-added { bottom: 90px; }
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(6px);
        z-index: 500;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0;
    }
    @media (min-width: 641px) {
        .modal-backdrop {
            align-items: center;
            padding: 16px;
        }
    }

    .modal-card {
        background: #fff;
        width: 100%;
        max-width: 880px;
        max-height: 92dvh;
        border-radius: 20px 20px 0 0;
        position: relative;
        overflow: hidden;
        box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
    }
    @media (min-width: 641px) {
        .modal-card {
            border-radius: 16px;
            max-height: 92vh;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        }
    }

    .modal-close {
        position: absolute;
        top: 14px; right: 14px;
        width: 34px; height: 34px;
        background: #f5f5f5;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        z-index: 10;
        border: none;
        cursor: pointer;
        color: #666;
        transition: background 0.15s, color 0.15s;
    }
    .modal-close:hover { background: #fee8e0; color: #D93518; }

    .modal-body {
        display: grid;
        grid-template-columns: 1fr;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    @media (min-width: 641px) {
        .modal-body { grid-template-columns: 1fr 1fr; }
    }

    .modal-left {
        background: #f8f8f8;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        position: relative;
        min-height: 160px;
        max-height: 200px;
    }
    @media (min-width: 641px) {
        .modal-left { padding: 20px; min-height: 200px; max-height: none; }
    }
    .modal-agotado-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }
    .modal-agotado-overlay span {
        background: #111;
        color: #fff;
        font-size: 14px;
        font-weight: 900;
        padding: 8px 20px;
        border-radius: 8px;
        letter-spacing: 0.1em;
    }
    .modal-img-frame { width: 100%; max-width: 120px; }
    @media (min-width: 641px) { .modal-img-frame { max-width: 300px; } }
    .modal-img { width: 100%; height: auto; object-fit: contain; border-radius: 8px; }

    .modal-right {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
    }
    @media (min-width: 641px) {
        .modal-right { padding: 20px; gap: 14px; }
    }

    .modal-header-info { display: flex; flex-direction: column; gap: 8px; }
    .modal-badges-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .modal-ref {
        font-size: 10.5px;
        font-weight: 700;
        color: #999;
        background: #f4f4f4;
        padding: 3px 8px;
        border-radius: 4px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }
    .modal-cat-badge {
        font-size: 10.5px;
        font-weight: 600;
        color: #D93518;
        background: #FCF0ED;
        padding: 3px 8px;
        border-radius: 4px;
    }
    .modal-title {
        font-size: 16px;
        font-weight: 800;
        color: #111;
        text-transform: capitalize;
        line-height: 1.3;
        margin: 0;
    }
    @media (min-width: 641px) { .modal-title { font-size: 20px; } }

    .vol-section { display: flex; flex-direction: column; gap: 8px; }
    .vol-label {
        font-size: 9.5px;
        font-weight: 800;
        color: #aaa;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }
    .vol-table {
        border: 1px solid #ebebeb;
        border-radius: 10px;
        overflow: hidden;
    }
    .vol-row {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        border-bottom: 1px solid #f5f5f5;
        gap: 12px;
        transition: background 0.1s;
    }
    .vol-row:last-child { border-bottom: none; }
    .vol-row:hover { background: #fafafa; }
    .vol-row-highlight { background: #FFF8F7; }
    .vol-row-highlight:hover { background: #FCF0ED; }

    .vol-qty {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 600;
        color: #444;
        min-width: 80px;
    }
    .vol-price {
        display: flex;
        align-items: baseline;
        gap: 2px;
        flex: 1;
    }
    .vol-bs { font-size: 11px; font-weight: 700; color: #D93518; }
    .vol-amount { font-size: 18px; font-weight: 900; color: #111; letter-spacing: -0.02em; }
    .vol-per { font-size: 10.5px; color: #aaa; font-weight: 500; margin-left: 2px; }

    .modal-total-block {
        background: #f8f8f8;
        border-radius: 10px;
        padding: 14px 16px;
    }
    .modal-total-info { display: flex; flex-direction: column; gap: 2px; }
    .modal-total-label { font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; }
    .modal-total-price { display: flex; align-items: baseline; gap: 3px; }
    .modal-total-bs { font-size: 14px; font-weight: 700; color: #D93518; }
    .modal-total-amount { font-size: 32px; font-weight: 900; color: #111; letter-spacing: -0.03em; line-height: 1; }

    .modal-features {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    .feature-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 600;
        color: #555;
        background: #f4f4f4;
        padding: 5px 10px;
        border-radius: 6px;
    }

    .modal-add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        background: #D93518;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 15px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        box-shadow: 0 4px 16px rgba(217,53,24,0.3);
        letter-spacing: 0.02em;
    }
    .modal-add-btn:hover { background: #BA2D14; }
    .modal-add-btn:active { transform: scale(0.98); }

    .modal-agotado-btn {
        text-align: center;
        padding: 15px;
        background: #f4f4f4;
        color: #aaa;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 700;
    }
</style>