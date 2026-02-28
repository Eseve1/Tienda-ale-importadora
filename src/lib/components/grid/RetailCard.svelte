<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fixUrl } from '$lib/utils';

	export let product: any;
	export let index: number = 0;
	export let descuentoGlobal: number = 0;

	const dispatch = createEventDispatcher();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (product.disponible) dispatch('showLocations', product);
		}
	}

	// LÓGICA:
	// descuento = -1  → sin descuento (excluido explícitamente)
	// descuento =  0  → usa el global
	// descuento > 0   → usa el propio %
	$: descuentoProp = Number(product.descuento ?? 0);
	$: descuentoEfectivo = descuentoProp === -1 ? 0 : descuentoProp > 0 ? descuentoProp : descuentoGlobal;
	$: tieneDescuento  = descuentoEfectivo > 0;
	$: originalPrice   = Number(product.precioUnidad);
	$: discountedPrice = tieneDescuento
		? Number((originalPrice * (1 - descuentoEfectivo / 100)).toFixed(2))
		: originalPrice;
</script>

<div
	class="card {!product.disponible ? 'card-agotado' : ''}"
	on:click={() => { if (product.disponible) dispatch('showLocations', product); }}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="card-img-wrap">
		{#if !product.disponible}
			<span class="badge-agotado">Agotado</span>
		{/if}

		<img
			src="{fixUrl(product.imagen)}&width=400&height=400&quality=85&output=webp"
			alt={product.descripcion}
			loading={index < 4 ? "eager" : "lazy"}
			fetchpriority={index < 4 ? "high" : "auto"}
			class="card-img {!product.disponible ? 'card-img-gray' : ''}"
		/>

		{#if product.disponible && tieneDescuento}
			<span class="discount-chip">-{descuentoEfectivo}%</span>
		{/if}
	</div>

	<div class="card-info">
		<p class="card-name">{product.descripcion.toLowerCase()}</p>

		<div class="price-block">
			<div class="total-row">
				<span class="t-bs">Bs.</span>
				<span class="t-number">{discountedPrice.toFixed(2)}</span>
			</div>
			{#if tieneDescuento}
				<span class="t-sub">antes Bs. {originalPrice.toFixed(2)}</span>
			{/if}
		</div>
	</div>
</div>

<style>
    .card {
        background: #fff; border-radius: 10px; border: 1px solid #ebebeb;
        overflow: hidden; cursor: pointer;
        transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
        display: flex; flex-direction: column;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .card:hover { border-color: #1A56DB; box-shadow: 0 6px 20px rgba(26,86,219,0.1); transform: translateY(-2px); }
    .card-agotado { opacity: 0.5; cursor: not-allowed; }

    .card-img-wrap { position: relative; width: 100%; padding-top: 100%; background: #f7f7f7; overflow: hidden; }
    .card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .card:hover:not(.card-agotado) .card-img { transform: scale(1.04); }
    .card-img-gray { filter: grayscale(1); }

    .badge-agotado {
        position: absolute; top: 8px; left: 8px; z-index: 2;
        background: rgba(0,0,0,0.7); color: #fff; font-size: 10px; font-weight: 800;
        padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .discount-chip {
        position: absolute; bottom: 8px; right: 8px; background: #1A56DB;
        color: #fff; font-size: 10px; font-weight: 800; padding: 3px 7px;
        border-radius: 4px; z-index: 2; letter-spacing: 0.02em;
    }

    .card-info { padding: 10px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .card-name {
        font-size: clamp(12px, 1.5vw, 14px); font-weight: 600; color: #111;
        line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden; text-transform: capitalize;
        margin: 0; min-height: 2.6em;
    }
    .price-block { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
    .total-row { display: flex; align-items: baseline; gap: 2px; }
    .t-bs { font-size: clamp(12px, 1.5vw, 14px); font-weight: 800; color: #1A56DB; }
    .t-number { font-size: clamp(18px, 2.5vw, 24px); font-weight: 900; color: #1A56DB; letter-spacing: -0.5px; line-height: 1; }
    .t-sub { font-size: clamp(11px, 1.3vw, 13px); font-weight: 500; color: #aaa; text-decoration: line-through; }
</style>