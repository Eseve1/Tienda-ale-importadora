<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fixUrl } from '$lib/utils';
	import { cart } from '$lib/stores/cart';

	export let product: any;
	export let index: number = 0;

	const dispatch = createEventDispatcher();


	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('select', product);
		}
	}

	function addToCart(e: Event) {
		e.stopPropagation();
		cart.add(product, product.moq || 12, 'mayorista');
	}

	$: unitPrice   = Number(product.preciopormayor);
	$: moq         = product.moq || 12;
	$: totalPrice  = unitPrice * moq;
</script>

<div
	class="card {!product.disponible ? 'card-agotado' : ''}"
	on:click={() => dispatch('select', product)}
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

		{#if product.disponible}
			<button on:click={addToCart} aria-label="Agregar al pedido" class="card-add-btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
				</svg>
			</button>
		{/if}
	</div>

	<div class="card-info">
		<p class="card-name">{product.descripcion.toLowerCase()}</p>

		<div class="price-block">
			<div class="total-row">
				<span class="t-bs">Bs.</span>
				<span class="t-number">{totalPrice.toFixed(2)}</span>
			</div>
			<span class="t-sub">por {moq} unid. · Bs. {unitPrice.toFixed(2)} c/u</span>
		</div>
	</div>
</div>

<style>
    .card {
        font-family: "Inter", sans-serif;
        background: #fff;
        border-radius: 10px;
        border: 1px solid #ebebeb;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .card:hover {
        border-color: #D93518;
        box-shadow: 0 6px 20px rgba(217,53,24,0.12);
        transform: translateY(-2px);
    }
    .card-agotado { opacity: 0.5; }

    .card-img-wrap {
        position: relative;
        width: 100%;
        padding-top: 100%;
        background: #f7f7f7;
        overflow: hidden;
    }
    .card-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .card-add-btn {
        position: absolute;
        bottom: 8px; right: 8px;
        width: 36px; height: 36px;
        background: #D93518;
        color: #fff;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(217,53,24,0.4);
        z-index: 2;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
    .card-add-btn:active { transform: scale(0.9); }

    .card-info {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }

    .card-name {
        font-size: clamp(12px, 1.5vw, 14px);
        font-weight: 600;
        color: #111;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-transform: capitalize;
        margin: 0;
        min-height: 2.6em;
    }

    /* PRECIO TOTAL PRINCIPAL */
    .price-block {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }
    .total-row {
        display: flex;
        align-items: baseline;
        gap: 2px;
    }
    .t-bs {
        font-size: clamp(12px, 1.5vw, 14px);
        font-weight: 800;
        color: #D93518;
    }
    .t-number {
        font-size: clamp(18px, 2.5vw, 24px);
        font-weight: 900;
        color: #D93518;
        letter-spacing: -0.5px;
        line-height: 1;
    }
    .t-sub {
        font-size: clamp(11px, 1.3vw, 13px);
        font-weight: 500;
        color: #111;
    }

</style>