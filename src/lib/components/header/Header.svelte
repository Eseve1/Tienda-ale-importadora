<script lang="ts">
	import { page } from '$app/stores';
	import { cart } from '$lib/stores/cart';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	const WHATSAPP_NUMBER = "59161333335";
	const WHATSAPP_MSG = encodeURIComponent("Hola! Vi el catálogo y quiero hacer un pedido por mayor");

	$: itemCount = $cart.count;
	$: isMayor = !$page.url.pathname.startsWith('/precios-unidad');
	$: isUnidad = $page.url.pathname.startsWith('/precios-unidad');
	$: accent     = isMayor ? '#D93518' : '#1A56DB';
	$: accentDark = isMayor ? '#BA2D14' : '#1446B8';
	$: accentBg   = isMayor ? '#FCF0ED' : '#EDF2FF';

	let menuOpen = false;
	let searchQuery = "";
	let searchUnidad = "";
	let y = 0;

	$: showHeaderSearch = !isMayor || y > 220;

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/colecciones/todo?q=${encodeURIComponent(searchQuery)}`);
			menuOpen = false;
		}
	}

	// Dispatch evento para que el catálogo de unidad escuche
	function handleSearchUnidad() {
		window.dispatchEvent(new CustomEvent('unidad-search', { detail: searchUnidad }));
	}

	function clearSearchUnidad() {
		searchUnidad = '';
		window.dispatchEvent(new CustomEvent('unidad-search', { detail: '' }));
	}

	const tickerItems = [
		"🚚 Envíos a todo Bolivia",
		"⭐ Precios de fábrica",
		"📦 Venta por cajas",
		"🔥 Ofertas semanales",
		"⚡ Despacho inmediato",
	];
</script>

<svelte:window bind:scrollY={y} />

<div
	style="--accent:{accent}; --accent-dark:{accentDark}; --accent-bg:{accentBg};"
	class="header-root"
>
	<div class="ticker-wrap" aria-hidden="true">
		<div class="ticker-track">
			{#each [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems] as item}
				<span class="ticker-item">{item}</span>
			{/each}
		</div>
	</div>

	<header class="site-header">
		<div class="top-bar">
			<div class="top-inner">

				<!-- LOGO -->
				<a href="/" class="logo-home" aria-label="Inicio">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"/>
					</svg>
				</a>

				<!-- TOGGLE -->
				<div class="mode-toggle" role="group" aria-label="Modo de compra">
					<a href="/" class="toggle-opt" class:toggle-active={isMayor}>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
						Por Mayor
					</a>
					<a href="/precios-unidad" class="toggle-opt" class:toggle-active={!isMayor}>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
						Por Unidad
					</a>
				</div>

				<!-- BUSCADOR: mayor usa goto, unidad usa evento local -->
				{#if isUnidad}
					<!-- Buscador integrado en header para /precios-unidad -->
					<form on:submit|preventDefault={handleSearchUnidad} class="search-box search-visible">
						<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
						</svg>
						<input
							type="search"
							bind:value={searchUnidad}
							on:input={handleSearchUnidad}
							class="search-input"
							placeholder="Buscar en unidad..."
							aria-label="Buscar productos por unidad"
						/>
						{#if searchUnidad}
							<button type="button" class="search-clear-btn" on:click={clearSearchUnidad} aria-label="Limpiar">✕</button>
						{/if}
					</form>
				{:else}
					<!-- Buscador normal para Por Mayor -->
					<form on:submit|preventDefault={handleSearch} class="search-box {showHeaderSearch ? 'search-visible' : 'search-hidden'}">
						<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
						</svg>
						<input type="search" bind:value={searchQuery} class="search-input" placeholder="Buscar por nombre o código..." aria-label="Buscar productos" />
						<button type="submit" class="search-btn">Buscar</button>
					</form>
				{/if}

				<!-- ACCIONES -->
				<div class="top-actions">
					<a href="https://wa.me/{WHATSAPP_NUMBER}?text={WHATSAPP_MSG}" target="_blank" rel="noopener" class="action-btn action-wa" aria-label="Pedidos por WhatsApp">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
						</svg>
						<span class="action-label">Pedidos</span>
					</a>

					<button on:click={() => cart.setIsOpen(true)} class="action-btn action-cart cart-desktop-only" aria-label="Ver carrito">
						<span class="cart-wrap">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
							</svg>
							{#if itemCount > 0}
								<span class="cart-count">{itemCount}</span>
							{/if}
						</span>
						<span class="action-label">Carrito</span>
					</button>

					<button class="action-hamburger" on:click={() => menuOpen = !menuOpen} aria-label="Menú" aria-expanded={menuOpen}>
						{#if menuOpen}
							<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
						{/if}
					</button>
				</div>
			</div>
		</div>

		{#if menuOpen}
			<div class="mobile-drawer" transition:slide={{duration: 220}}>
				<div class="drawer-toggle" role="group">
					<a href="/" class="drawer-toggle-opt" class:drawer-toggle-active={isMayor} on:click={() => menuOpen = false}>🏭 Por Mayor</a>
					<a href="/precios-unidad" class="drawer-toggle-opt" class:drawer-toggle-active={!isMayor} on:click={() => menuOpen = false}>🛍️ Por Unidad</a>
				</div>
				{#if isUnidad}
					<form on:submit|preventDefault={handleSearchUnidad} class="drawer-search">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
						<input type="search" bind:value={searchUnidad} on:input={handleSearchUnidad} class="drawer-search-input" placeholder="Buscar en unidad..." />
					</form>
				{/if}
				<a href="https://wa.me/{WHATSAPP_NUMBER}?text={WHATSAPP_MSG}" target="_blank" rel="noopener" class="drawer-wa" on:click={() => menuOpen = false}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
					</svg>
					Hacer pedido por WhatsApp
				</a>
			</div>
		{/if}
	</header>
</div>

<style>
    .header-root { display: contents; }
    .ticker-wrap {
        background: var(--accent); overflow: hidden; white-space: nowrap;
        height: 38px; display: flex; align-items: center;
        position: sticky; top: 0; z-index: 201;
    }
    .ticker-track { display: inline-flex; align-items: center; animation: ticker-scroll 50s linear infinite; will-change: transform; }
    .ticker-track:hover { animation-play-state: paused; }
    .ticker-item { display: inline-block; padding: 0 28px; font-size: 11.5px; font-weight: 700; color: #fff; letter-spacing: 0.07em; text-transform: uppercase; flex-shrink: 0; }
    .ticker-item::after { content: "◆"; margin-left: 24px; opacity: 0.3; font-size: 7px; }
    @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }

    .site-header { position: sticky; top: 38px; z-index: 200; background: #fff; border-bottom: 1px solid #ebebeb; box-shadow: 0 1px 12px rgba(0,0,0,0.06); }
    .top-bar { padding: 0; }
    .top-inner { max-width: 1536px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 14px; box-sizing: border-box; }

    .logo-home { display: none; align-items: center; justify-content: center; color: #999; text-decoration: none; flex-shrink: 0; width: 36px; height: 36px; border-radius: 8px; transition: color 0.15s, background 0.15s; }
    .logo-home:hover { color: var(--accent); background: var(--accent-bg); }
    @media (min-width: 640px) { .logo-home { display: flex; } }

    .mode-toggle { display: flex; background: #f4f4f4; border-radius: 8px; padding: 3px; gap: 2px; flex-shrink: 0; }
    .toggle-opt { display: flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #666; text-decoration: none; white-space: nowrap; transition: background 0.15s, color 0.15s; }
    .toggle-opt:hover:not(.toggle-active) { background: #e8e8e8; color: #333; }
    .toggle-opt.toggle-active { background: var(--accent); color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }

    .search-box { flex: 1; display: none; align-items: center; border: 1.5px solid #e4e4e4; border-radius: 8px; height: 40px; background: #f8f8f8; transition: all 0.3s ease; }
    .search-hidden { opacity: 0; pointer-events: none; transform: translateY(5px); }
    .search-visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
    @media (min-width: 580px) { .search-box { display: flex; } }
    .search-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,0,0,0.08); background: #fff; }
    .search-icon { flex-shrink: 0; margin: 0 10px; color: #ccc; transition: color 0.2s; }
    .search-box:focus-within .search-icon { color: var(--accent); }
    .search-input { flex: 1; height: 100%; border: none; outline: none; padding: 0 8px 0 0; font-size: 13.5px; color: #222; background: transparent; }
    .search-input::placeholder { color: #bbb; }
    .search-btn { height: 100%; background: var(--accent); border: none; cursor: pointer; padding: 0 18px; color: #fff; font-size: 12.5px; font-weight: 700; flex-shrink: 0; transition: background 0.15s; border-radius: 0 6px 6px 0; }
    .search-btn:hover { background: var(--accent-dark); }
    .search-clear-btn { height: 100%; background: transparent; border: none; cursor: pointer; padding: 0 12px; color: #aaa; font-size: 13px; flex-shrink: 0; transition: color 0.15s; }
    .search-clear-btn:hover { color: #ef4444; }

    .top-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; margin-left: auto; }
    @media (min-width: 640px) { .top-actions { margin-left: 0; } }
    .action-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 10px; border-radius: 8px; text-decoration: none; background: none; border: none; cursor: pointer; transition: background 0.15s; }
    .action-wa { color: #25D366; }
    .action-cart { color: #444; }
    .action-wa:hover { background: #f0fdf4; }
    .action-cart:hover { background: var(--accent-bg); color: var(--accent); }
    .action-label { font-size: 10.5px; font-weight: 600; white-space: nowrap; }
    @media (max-width: 639px) { .action-label { display: none; } }

    /* Carrito solo visible en desktop - en móvil hay botón flotante */
    .cart-desktop-only { display: none; }
    @media (min-width: 640px) { .cart-desktop-only { display: flex; } }

    .cart-wrap { position: relative; display: flex; }
    .cart-count { position: absolute; top: -5px; right: -6px; background: var(--accent); color: #fff; font-size: 9px; font-weight: 800; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #fff; }

    .action-hamburger { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: #444; padding: 8px; border-radius: 8px; transition: background 0.15s; }
    .action-hamburger:hover { background: #f5f5f5; }
    @media (min-width: 768px) { .action-hamburger { display: none; } }

    .mobile-drawer { background: #fff; border-top: 1px solid #f0f0f0; padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 10px; }
    .drawer-toggle { display: flex; background: #f5f5f5; border-radius: 10px; padding: 4px; gap: 4px; }
    .drawer-toggle-opt { flex: 1; text-align: center; padding: 10px; border-radius: 7px; font-size: 14px; font-weight: 600; color: #666; text-decoration: none; transition: background 0.15s, color 0.15s; }
    .drawer-toggle-opt:hover:not(.drawer-toggle-active) { background: #ebebeb; }
    .drawer-toggle-opt.drawer-toggle-active { background: var(--accent); color: #fff; }
    .drawer-search { display: flex; align-items: center; gap: 8px; background: #f8f8f8; border: 1.5px solid #e4e4e4; border-radius: 10px; padding: 10px 14px; }
    .drawer-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; font-weight: 600; color: #222; }
    .drawer-wa { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; background: #25D366; color: #fff; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 700; transition: background 0.2s; }
    .drawer-wa:hover { background: #1ebe5d; }
</style>