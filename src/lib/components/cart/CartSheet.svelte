<script lang="ts">
	import { cart } from '$lib/stores/cart';
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import { writable } from 'svelte/store';

	const PHONE = '59161333335';

	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	function enviarWhatsApp() {
		if (!$cart.items.length) return;
		let mensaje = "Hola Ale Importadora. Mi pedido detallado:\n\n";
		$cart.items.forEach((item: any) => {
			const precioUnitario = item.priceType === 'unidad'
				? (Number(item.product.precioUnidad) * 0.8)
				: Number(item.product.preciopormayor);
			mensaje += `Producto: ${item.product.descripcion}\n`;
			mensaje += `Ref: ${item.product.codigo}\n`;
			mensaje += `Cant: ${item.quantity}\n`;
			mensaje += `Precio c/u: Bs. ${precioUnitario.toFixed(2)}\n`;
			mensaje += `Subtotal: Bs. ${(precioUnitario * item.quantity).toFixed(2)}\n\n`;
		});
		mensaje += `TOTAL DEL PEDIDO: Bs. ${$cart.total.toFixed(2)}`;
		if (browser) window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`, '_blank');
	}

	function bajarCantidad(item: any) {
		const minimo = item.product.moq || 12;
		if (item.quantity > minimo) cart.updateQuantity(item.product.$id, -1);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cart.setIsOpen(false);
	}

	export const selectedProduct = writable(null);
</script>

<div class="fab-wrap">
	<button
		on:click={() => cart.setIsOpen(!$cart.isOpen)}
		aria-label="Ver mi pedido"
		class="fab"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
			<path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
		</svg>
		{#if $cart.items.length > 0}
			<span class="fab-badge">{$cart.items.length}</span>
		{/if}
	</button>
</div>

{#if $cart.isOpen}
	<div class="overlay" transition:fade={{ duration: 200 }}>
		<div
			role="button" tabindex="0"
			class="backdrop"
			on:click={() => cart.setIsOpen(false)}
			on:keydown={handleKeydown}
			aria-label="Cerrar carrito"
		></div>

		<div
			transition:fly={{ x: 420, duration: 280 }}
			class="sheet"
			role="dialog"
			aria-modal="true"
		>
			<div class="sheet-header">
				<div class="sheet-title-wrap">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
					</svg>
					<h2 class="sheet-title">Tu Pedido</h2>
					{#if $cart.items.length > 0}
						<span class="sheet-count">{$cart.items.length}</span>
					{/if}
				</div>
				<button on:click={() => cart.setIsOpen(false)} class="sheet-close" aria-label="Cerrar">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="sheet-body">
				{#each $cart.items as item (item.product.$id)}
					<div class="item-card">
						<button on:click={() => cart.remove(item.product.$id)} class="item-remove" aria-label="Eliminar">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<div class="item-img">
							<img
								src="{fixUrl(item.product.imagen)}&width=150&height=150&quality=60&output=webp"
								alt={item.product.descripcion}
								class="item-img-el"
							/>
						</div>

						<div class="item-info">
							<p class="item-name">{item.product.descripcion.toLowerCase()}</p>
							<p class="item-ref">Ref: {item.product.codigo}</p>
							<div class="item-bottom">
								<span class="item-price">Bs. {Number(item.price).toFixed(2)} <span class="item-price-cu">c/u</span></span>
								<div class="qty-control">
									<button
										class="qty-btn"
										class:qty-disabled={item.quantity <= (item.product.moq || 12)}
										on:click={() => bajarCantidad(item)}
										disabled={item.quantity <= (item.product.moq || 12)}
										aria-label="Reducir"
									>−</button>
									<span class="qty-val">{item.quantity}</span>
									<button
										class="qty-btn"
										on:click={() => cart.updateQuantity(item.product.$id, 1)}
										aria-label="Aumentar"
									>+</button>
								</div>
							</div>
							{#if item.quantity <= (item.product.moq || 12)}
								<span class="item-moq">Compra mínima: {item.product.moq || 12} unid.</span>
							{/if}
						</div>
					</div>
				{/each}

				{#if $cart.items.length === 0}
					<div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
						<p>Tu carrito está vacío</p>
					</div>
				{/if}
			</div>

			{#if $cart.items.length > 0}
				<div class="sheet-footer">
					<div class="total-row">
						<span class="total-label">Total estimado</span>
						<div class="total-right">
							<span class="total-amount">Bs. {$cart.total.toFixed(2)}</span>
							<span class="total-sub">No incluye envío</span>
						</div>
					</div>
					<button on:click={enviarWhatsApp} class="confirm-btn">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
						</svg>
						Confirmar pedido por WhatsApp
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
    .fab-wrap {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 400;
        pointer-events: none;
    }
    .fab {
        position: relative;
        width: 52px; height: 52px;
        border-radius: 50%;
        background: #D93518;
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        box-shadow: 0 4px 18px rgba(217,53,24,0.45);
        transition: transform 0.15s, box-shadow 0.15s;
    }
    .fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(217,53,24,0.55); }
    .fab:active { transform: scale(0.94); }
    .fab-badge {
        position: absolute;
        top: -3px; right: -3px;
        background: #111;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        min-width: 18px; height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #fff;
    }

    .overlay {
        position: fixed;
        inset: 0;
        z-index: 500;
    }
    .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(13,27,42,0.7);
        backdrop-filter: blur(4px);
        cursor: pointer;
        border: none;
    }

    .sheet {
        position: absolute;
        top: 0; right: 0;
        height: 100vh; /* Fallback */
        height: 100dvh; /* Adaptación perfecta móvil */
        width: 100%;
        max-width: 400px;
        background: #fff;
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 40px rgba(0,0,0,0.15);
    }

    .sheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid #f0f0f0;
        background: #fff;
    }
    .sheet-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #111;
    }
    .sheet-title {
        font-size: 16px;
        font-weight: 800;
        color: #111;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
    }
    .sheet-count {
        background: #D93518;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        min-width: 20px; height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
    }
    .sheet-close {
        width: 34px; height: 34px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: background 0.15s, color 0.15s;
    }
    .sheet-close:hover { background: #FCF0ED; color: #D93518; }

    .sheet-body {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: #f8f8f8;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .item-card {
        background: #fff;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        gap: 12px;
        position: relative;
        border: 1px solid #f0f0f0;
    }
    .item-remove {
        position: absolute;
        top: 8px; right: 8px;
        width: 26px; height: 26px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaa;
        transition: background 0.15s, color 0.15s;
    }
    .item-remove:hover { background: #FCF0ED; color: #D93518; }

    .item-img {
        width: 65px; height: 65px;
        background: #f8f8f8;
        border-radius: 8px;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .item-img-el { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }

    .item-info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding-right: 22px; min-width: 0; }
    .item-name { font-size: 12px; font-weight: 600; color: #222; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: capitalize; margin: 0; }
    .item-ref { font-size: 10px; color: #bbb; font-weight: 500; margin: 0; }

    .item-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; gap: 8px; }
    .item-price { font-size: 13.5px; font-weight: 800; color: #111; white-space: nowrap; }
    .item-price-cu { font-size: 10px; color: #888; font-weight: 600; }

    .qty-control { display: flex; align-items: center; background: #f5f5f5; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
    .qty-btn { width: 28px; height: 28px; border: none; background: none; cursor: pointer; font-size: 15px; font-weight: 700; color: #333; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; }
    .qty-btn:hover:not(:disabled) { background: #D93518; color: #fff; }
    .qty-btn.qty-disabled { color: #ccc; cursor: not-allowed; }
    .qty-val { font-size: 11.5px; font-weight: 800; color: #222; min-width: 26px; text-align: center; }

    .item-moq { font-size: 9.5px; color: #D93518; font-weight: 600; }

    .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: #ccc; text-align: center; }
    .empty-state p { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }

    .sheet-footer {
        padding: 20px;
        background: #fff;
        border-top: 1px solid #f0f0f0;
        padding-bottom: max(20px, env(safe-area-inset-bottom)); /* Zona segura iPhone */
    }
    .total-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; }
    .total-label { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.08em; }
    .total-right { display: flex; flex-direction: column; align-items: flex-end; }
    .total-amount { font-size: 26px; font-weight: 900; color: #111; line-height: 1; }
    .total-sub { font-size: 10px; color: #bbb; font-weight: 500; margin-top: 2px; }

    .confirm-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #25D366;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 15px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        box-shadow: 0 4px 16px rgba(37,211,102,0.3);
    }
    .confirm-btn:hover { background: #1ebe5d; }
    .confirm-btn:active { transform: scale(0.98); }
</style>