<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/header/Header.svelte';
	import CartSheet from '$lib/components/cart/CartSheet.svelte';

	$: isAdmin  = $page.url.pathname.startsWith('/admin');
	$: isUnidad = $page.url.pathname.startsWith('/precios-unidad');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</svelte:head>

{#if !isAdmin}
	<Header />
{/if}

<slot />

{#if !isAdmin && !isUnidad}
	<CartSheet />
{/if}

<style>
    :global(body, button, input, select, textarea) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
</style>