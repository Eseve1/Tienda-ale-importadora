<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { Client, Databases, Query } from 'appwrite';
	import { fixUrl } from '$lib/utils';
	import RetailCard from '$lib/components/grid/RetailCard.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';

	const ENDPOINT   = "https://app.grupo59.com/v1";
	const PROJECT_ID = "6978d1bc000bad7c5671";
	const DB_ID      = "6978d1f3000ea0b56ebc";
	const COLLECTION_ID  = "catalogo_ale";
	const CONFIG_ID      = "configuracion";

	const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
	const db     = new Databases(client);

	interface Product {
		$id: string;
		descripcion: string;
		precioUnidad: number;
		imagen: string;
		disponible: boolean;
		codigo?: string;
		categoria?: string;
		descuento?: number; // -1 = sin descuento aunque haya global, 0 = usar global, >0 = % propio
	}

	let productos:    Product[] = [];
	let loading      = true;
	let loadingMore  = false;
	let searchTerm   = "";
	let offset       = 0;
	let hasMore      = true;
	let lastCursor:  string | null = null;
	let catActual    = "Todo";
	let modalOpen    = false;
	let selectedProduct: Product | null = null;
	let y = 0;
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Descuento global leído de Appwrite
	let descuentoGlobal = 0;

	const LIMIT = 50;

	const categorias = [
		{ label: "Todo",              icon: "🗂️" },
		{ label: "Belleza y salud",   icon: "💄" },
		{ label: "Herramientas",      icon: "🔧" },
		{ label: "Hogar y cocina",    icon: "🏠" },
		{ label: "Infantil",          icon: "🧸" },
		{ label: "Moda y equipaje",   icon: "👜" },
		{ label: "Oficina y escolar", icon: "📚" },
		{ label: "Tecnología",        icon: "📱" },
	];

	const sucursales = [
		{ nombre: "Sucursal Cañoto",   referencia: "Mercado Cañoto, Santa Cruz",    url: "https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Cañoto+Santa+Cruz" },
		{ nombre: "Sucursal Los Pozos", referencia: "Mercado Los Pozos, Santa Cruz", url: "https://www.google.com/maps/search/?api=1&query=Importadora+Ale+Los+Pozos+Santa+Cruz" }
	];

	// LÓGICA DE DESCUENTO:
	// producto.descuento = -1  → sin descuento (ignora global)
	// producto.descuento =  0  → usa el descuento global
	// producto.descuento > 0   → usa su propio %
	function getDescuento(product: Product): number {
		const d = Number(product.descuento ?? 0);
		if (d === -1) return 0;           // excluido explícitamente
		if (d > 0)   return d;            // tiene su propio %
		return descuentoGlobal;           // usa el global
	}

	function getPrecioFinal(product: Product): number {
		const desc = getDescuento(product);
		if (desc > 0) return Number((product.precioUnidad * (1 - desc / 100)).toFixed(2));
		return product.precioUnidad;
	}

	// Carga el descuento global desde Appwrite
	async function cargarConfig() {
		try {
			const res = await db.listDocuments(DB_ID, CONFIG_ID, [
				Query.equal('clave', 'descuento_global'),
				Query.limit(1)
			]);
			if (res.documents.length > 0) {
				descuentoGlobal = parseInt(res.documents[0].valor) || 0;
			}
		} catch (e) {
			console.error('Config error:', e);
		}
	}

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
				Query.select(['$id','descripcion','preciopormayor','precioUnidad','imagen','disponible','moq','codigo','categoria','descuento']),
			];
			if (loadMore && lastCursor) queries.push(Query.cursorAfter(lastCursor));
			if (searchTerm?.trim().length > 0) {
				queries.push(Query.or([Query.contains("codigo", searchTerm), Query.contains("descripcion", searchTerm)]));
			} else if (catActual !== 'Todo') {
				queries.push(Query.equal("categoria", catActual));
			}

			const res = await db.listDocuments(DB_ID, COLLECTION_ID, queries);
			let nuevos = (res.documents ?? []) as unknown as Product[];
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

	function onSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (searchTerm.trim().length > 1 || searchTerm.trim().length === 0) {
				cargarProductos(true, false);
			}
		}, 350);
	}

	// Escucha el buscador del header cuando está en /precios-unidad
	function onHeaderSearch(e: CustomEvent) {
		searchTerm = (e as CustomEvent).detail;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => cargarProductos(true, false), 350);
	}

	function seleccionarCategoria(cat: string) {
		catActual = cat;
		searchTerm = "";
		cargarProductos();
	}

	function abrirModal(producto: Product) {
		selectedProduct = producto;
		modalOpen = true;
		if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
	}

	function cerrarModal() {
		modalOpen = false;
		selectedProduct = null;
		if (typeof document !== 'undefined') document.body.style.overflow = '';
	}

	onMount(() => {
		cargarConfig().then(() => cargarProductos());

		// Escucha el buscador del header via CustomEvent
		const handler = (e: Event) => {
			searchTerm = (e as CustomEvent<string>).detail;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => cargarProductos(true, false), 350);
		};
		window.addEventListener('unidad-search', handler);
		return () => window.removeEventListener('unidad-search', handler);
	});
</script>

<svelte:head>
	<title>Ale Importadora | Catálogo Por Unidad</title>
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="page-wrap">

	<div class="retail-banner">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span><strong>Solo venta en tienda:</strong> Comprá directamente en nuestras sucursales. No realizamos envíos ni retiros a domicilio por unidad.</span>
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
				<p class="sidebar-contact-title">¿Dónde estamos?</p>
				{#each sucursales as s}
					<a href={s.url} target="_blank" rel="noopener" class="sidebar-location-btn">
						<div class="sidebar-location-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						</div>
						<div class="sidebar-location-info">
							<span class="sidebar-location-name">{s.nombre}</span>
							<span class="sidebar-location-ref">{s.referencia}</span>
						</div>
					</a>
				{/each}
			</div>
		</aside>

		<main class="catalog-main">

			{#if loading && !productos.length}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<span>Cargando catálogo...</span>
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
					{#if descuentoGlobal > 0}
						<span class="results-descuento">🏷️ -{descuentoGlobal}% en tienda</span>
					{/if}
				</div>

				<div class="products-grid">
					{#each productos as product, i (product.$id)}
						<RetailCard
							{product}
							index={i}
							descuentoGlobal={descuentoGlobal}
							on:showLocations={(e) => abrirModal(e.detail)}
						/>
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

	<!-- MODAL -->
	{#if modalOpen && selectedProduct}
		<div class="modal-backdrop" on:click={cerrarModal} on:keydown={(e) => e.key === 'Escape' && cerrarModal()} role="dialog" aria-modal="true" tabindex="-1" transition:fade={{ duration: 180 }}>
			<div class="modal-card" on:click|stopPropagation on:keydown={() => {}} role="document" transition:fly={{ y: 24, duration: 220 }}>

				<button class="modal-close" on:click={cerrarModal} aria-label="Cerrar">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
				</button>

				<div class="modal-body">
					<div class="modal-left">
						{#if !selectedProduct.disponible}
							<div class="modal-agotado-overlay"><span>AGOTADO</span></div>
						{/if}
						{#if getDescuento(selectedProduct) > 0}
							<span class="modal-discount-chip">-{getDescuento(selectedProduct)}% en tienda</span>
						{/if}
						<div class="modal-img-frame">
							<img src="{fixUrl(selectedProduct.imagen)}&width=600&quality=85&output=webp" alt={selectedProduct.descripcion} class="modal-img" />
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

						<div class="modal-price-block">
							<span class="modal-price-label">Precio en tienda</span>
							<div class="modal-price-row">
								{#if getDescuento(selectedProduct) > 0}
									<span class="modal-original">Bs. {Number(selectedProduct.precioUnidad).toFixed(2)}</span>
								{/if}
								<div class="modal-discounted">
									<span class="modal-price-bs">Bs.</span>
									<span class="modal-price-amount">{getPrecioFinal(selectedProduct).toFixed(2)}</span>
								</div>
							</div>
						</div>

						<div class="modal-locations-label">Disponible en estas sucursales:</div>

						{#each sucursales as s}
							<a href={s.url} target="_blank" rel="noopener" class="location-item">
								<div class="location-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
									</svg>
								</div>
								<div class="location-info">
									<span class="location-name">{s.nombre}</span>
									<span class="location-sub">{s.referencia} · Ver en Maps →</span>
								</div>
							</a>
						{/each}

					</div>
				</div>
			</div>
		</div>
	{/if}

</div>

<style>
    .page-wrap { min-height: 100vh; background: #f0f2f5; display: flex; flex-direction: column; }

    .retail-banner {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        background: #EDF2FF; color: #1035A0; padding: 12px 24px;
        font-size: 12.5px; border-bottom: 1px solid #93AEFB; text-align: center;
    }

    .cat-mobile {
        display: flex; overflow-x: auto; scrollbar-width: none;
        -webkit-overflow-scrolling: touch; padding: 12px 16px; gap: 8px;
        background: #fff; border-bottom: 1px solid #ebebeb;
    }
    .cat-mobile::-webkit-scrollbar { display: none; }
    @media (min-width: 768px) { .cat-mobile { display: none; } }

    .cat-chip {
        flex-shrink: 0; display: flex; align-items: center; gap: 5px;
        padding: 7px 13px; border-radius: 999px; font-size: 12px; font-weight: 600;
        border: 1.5px solid #e5e7eb; background: #fff; color: #555;
        cursor: pointer; white-space: nowrap; transition: all 0.15s;
    }
    .cat-chip:hover { border-color: #1A56DB; color: #1A56DB; }
    .cat-chip-active { background: #1A56DB; color: #fff; border-color: #1A56DB; }
    .chip-icon { font-size: 14px; }

    .catalog-layout {
        display: flex; flex: 1; max-width: 1400px; margin: 0 auto;
        width: 100%; padding: 24px 16px; gap: 24px;
    }

    .cat-sidebar { display: none; width: 220px; flex-shrink: 0; }
    @media (min-width: 768px) { .cat-sidebar { display: block; } }

    .sidebar-title {
        font-size: 10px; font-weight: 800; color: #aaa;
        text-transform: uppercase; letter-spacing: 0.1em;
        margin-bottom: 8px; padding-left: 4px;
    }
    .sidebar-item {
        display: flex; align-items: center; gap: 8px; width: 100%;
        padding: 9px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;
        color: #555; background: transparent; border: none; cursor: pointer;
        transition: all 0.15s; text-align: left; margin-bottom: 2px;
    }
    .sidebar-item:hover { background: #f0f2f5; color: #111; }
    .sidebar-item-active { background: #EDF2FF; color: #1A56DB; }
    .sidebar-icon { font-size: 16px; flex-shrink: 0; }
    .sidebar-label { flex: 1; }
    .sidebar-arrow { color: #ccc; margin-left: auto; }
    .sidebar-item-active .sidebar-arrow { color: #1A56DB; }

    .sidebar-contact {
        margin-top: 24px; padding-top: 20px;
        border-top: 1px solid #ebebeb; display: flex; flex-direction: column; gap: 8px;
    }
    .sidebar-contact-title {
        font-size: 10px; font-weight: 800; color: #aaa;
        text-transform: uppercase; letter-spacing: 0.1em;
        margin-bottom: 4px; padding-left: 4px;
    }
    .sidebar-location-btn {
        display: flex; align-items: center; gap: 10px; padding: 10px;
        border-radius: 10px; border: 1.5px solid #ebebeb; text-decoration: none;
        transition: border-color 0.15s, background 0.15s; background: #fff;
    }
    .sidebar-location-btn:hover { border-color: #1A56DB; background: #EDF2FF; }
    .sidebar-location-icon {
        width: 30px; height: 30px; background: #EDF2FF; border-radius: 7px;
        display: flex; align-items: center; justify-content: center;
        color: #1A56DB; flex-shrink: 0;
    }
    .sidebar-location-info { display: flex; flex-direction: column; gap: 1px; }
    .sidebar-location-name { font-size: 12px; font-weight: 700; color: #111; line-height: 1.2; }
    .sidebar-location-ref { font-size: 10px; color: #aaa; font-weight: 500; }

    .catalog-main { flex: 1; min-width: 0; }

    /* BUSCADOR */
    .results-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .results-count { font-size: 13px; font-weight: 700; color: #333; }
    .results-cat { font-size: 12px; color: #1A56DB; font-weight: 600; background: #EDF2FF; padding: 2px 8px; border-radius: 4px; }
    .results-descuento { font-size: 12px; color: #fff; font-weight: 700; background: #1A56DB; padding: 2px 8px; border-radius: 4px; }

    .loading-state {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 12px; padding: 80px 0;
        color: #888; font-size: 13px; font-weight: 600;
    }
    .loading-spinner {
        width: 28px; height: 28px; border: 3px solid #e5e7eb;
        border-top-color: #1A56DB; border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 12px; padding: 80px 0; color: #aaa;
    }
    .empty-state p { font-size: 14px; font-weight: 600; color: #555; }

    .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 768px)  { .products-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 1200px) { .products-grid { grid-template-columns: repeat(5, 1fr); } }

    .load-more-wrap { display: flex; justify-content: center; padding: 24px 0 32px; }
    .load-more-btn {
        padding: 12px 36px; border: 2px solid #1A56DB; color: #1A56DB;
        background: #fff; border-radius: 999px; font-size: 14px; font-weight: 700;
        cursor: pointer; transition: all 0.2s;
    }
    .load-more-btn:hover { background: #1A56DB; color: #fff; }
    .load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .scroll-top-btn {
        position: fixed; bottom: 88px; right: 20px; width: 42px; height: 42px;
        background: #111; color: #fff; border: none; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 300; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    /* MODAL */
    .modal-backdrop {
        position: fixed; inset: 0; background: rgba(0,0,0,0.65);
        backdrop-filter: blur(6px); z-index: 500;
        display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .modal-card {
        background: #fff; width: 100%; max-width: 780px; max-height: 92vh;
        border-radius: 16px; position: relative; overflow: hidden;
        box-shadow: 0 30px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column;
    }
    .modal-close {
        position: absolute; top: 14px; right: 14px; width: 34px; height: 34px;
        background: #f5f5f5; border-radius: 50%; display: flex; align-items: center;
        justify-content: center; z-index: 10; border: none; cursor: pointer;
        color: #666; transition: background 0.15s, color 0.15s;
    }
    .modal-close:hover { background: #C3D4FD; color: #1A56DB; }
    .modal-body { display: grid; grid-template-columns: 1fr 1fr; overflow-y: auto; flex: 1; min-height: 0; }
    @media (max-width: 640px) { .modal-body { grid-template-columns: 1fr; } }
    .modal-left {
        background: #f8f8f8; display: flex; align-items: center;
        justify-content: center; padding: 32px; position: relative; min-height: 300px;
    }
    .modal-agotado-overlay {
        position: absolute; inset: 0; background: rgba(0,0,0,0.45);
        display: flex; align-items: center; justify-content: center; z-index: 2;
    }
    .modal-agotado-overlay span {
        background: #111; color: #fff; font-size: 14px; font-weight: 900;
        padding: 8px 20px; border-radius: 8px; letter-spacing: 0.1em;
    }
    .modal-discount-chip {
        position: absolute; top: 14px; left: 14px; background: #1A56DB;
        color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px;
        border-radius: 5px; z-index: 3; letter-spacing: 0.02em;
    }
    .modal-img-frame { width: 100%; max-width: 280px; }
    .modal-img { width: 100%; height: auto; object-fit: contain; border-radius: 8px; }
    .modal-right {
        padding: 28px 28px 24px; display: flex; flex-direction: column;
        gap: 16px; overflow-y: auto; min-height: 0;
    }
    .modal-header-info { display: flex; flex-direction: column; gap: 8px; }
    .modal-badges-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .modal-ref { font-size: 10.5px; font-weight: 700; color: #999; background: #f4f4f4; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; text-transform: uppercase; }
    .modal-cat-badge { font-size: 10.5px; font-weight: 600; color: #1A56DB; background: #EDF2FF; padding: 3px 8px; border-radius: 4px; }
    .modal-title { font-size: 20px; font-weight: 800; color: #111; text-transform: capitalize; line-height: 1.3; margin: 0; }
    .modal-price-block { display: flex; flex-direction: column; gap: 6px; background: #f8f8f8; border-radius: 10px; padding: 14px 16px; }
    .modal-price-label { font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; }
    .modal-price-row { display: flex; align-items: center; gap: 12px; }
    .modal-original { font-size: 14px; color: #bbb; text-decoration: line-through; font-weight: 500; }
    .modal-discounted { display: flex; align-items: baseline; gap: 2px; }
    .modal-price-bs { font-size: 14px; font-weight: 700; color: #1A56DB; }
    .modal-price-amount { font-size: 32px; font-weight: 900; color: #111; letter-spacing: -0.03em; line-height: 1; }
    .modal-locations-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.08em; }
    .location-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #ebebeb; border-radius: 10px; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
    .location-item:hover { border-color: #1A56DB; background: #EDF2FF; }
    .location-icon { width: 36px; height: 36px; background: #EDF2FF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #1A56DB; flex-shrink: 0; }
    .location-info { display: flex; flex-direction: column; gap: 2px; }
    .location-name { font-size: 14px; font-weight: 700; color: #111; }
    .location-sub { font-size: 11px; color: #aaa; font-weight: 500; }
</style>