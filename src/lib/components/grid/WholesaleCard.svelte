<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	export let product: any;
	export let index: number = 0;
	export let showUnitPrice: boolean = false;

	const dispatch = createEventDispatcher();

	// ✅ FIX: Reemplaza URLs viejas al vuelo
	function fixUrl(url: string): string {
		if (!url) return '';
		return url.replace('https://api.importadoraale.app/v1', 'https://app.grupo59.com/v1');
	}

	const salesTags = [
		"🔥 +1 docena vendida hoy", "🔥 +5 docenas vendidas hoy", "🔥 +2 docenas despachadas ",
		"🌍 Envíos a los 9 departamentos", "🚚 Saliendo carga a La Paz", "⭐ Alta rotación en El Alto",
		"📦 Pedido frecuente en Tarija", "🚚 Envío listo para Trinidad - Beni", "📦 Despacho a Riberalta",
		"🚚 Ruta activa a Rurrenabaque", "📦 Envíos a Cobija - Pando", "📦 Saliendo pedido a Sucre",
		"🔥 Top ventas en Cochabamba", "📦 Envíos diarios a Potosí y Oruro", "✅ Stock verificado por Ale",
		"✅ Salida diaria de mercadería"
	];
	let i = 0;
	let interval: any;

	onMount(() => {
		const delay = 2000 + Math.random() * 2000;
		setTimeout(() => {
			interval = setInterval(() => {
				i = (i + 1) % salesTags.length;
			}, 3500);
		}, delay);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('select', product);
		}
	}

	function calculateDiscountedPrice(price: number): number {
		return price * 0.8;
	}
</script>

<div
	class="group relative bg-white rounded-xl border border-gray-200 flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden font-sans h-full { !product.disponible ? 'opacity-60' : '' }"
	on:click={() => dispatch('select', product)}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	{#if !product.disponible}
		<div class="absolute top-0 right-0 z-20 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
			Agotado
		</div>
	{/if}

	<div class="aspect-square w-full relative bg-[#f8f8f8]">
		<img
			src="{fixUrl(product.imagen)}&width=400&height=400&quality=75&output=webp"
			alt={product.descripcion}
			loading={index < 4 ? "eager" : "lazy"}
			fetchpriority={index < 4 ? "high" : "auto"}
			width="400"
			height="400"
			class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 { !product.disponible ? 'grayscale' : '' }"
		/>

		{#if product.imagen2}
			<img
				src="{fixUrl(product.imagen2)}&width=400&height=400&quality=75&output=webp"
				alt="{product.descripcion} vista 2"
				loading="lazy"
				width="400"
				height="400"
				class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 { !product.disponible ? 'grayscale' : '' }"
			/>
		{/if}
	</div>

	<div class="p-2 flex flex-col flex-1">
		<div class="mb-1.5">
			<h3 class="font-sans font-medium text-[#222] text-[11px] leading-3 line-clamp-2 h-[24px] mb-0.5 capitalize">
				{product.descripcion.toLowerCase()}
			</h3>

			<div class="flex items-baseline gap-0.5 text-[#222]">
				<span class="text-[10px] font-bold">Bs.</span>
				<span class="font-sans font-black text-base leading-none">
					{showUnitPrice ? calculateDiscountedPrice(Number(product.precioUnidad)).toFixed(2) : Number(product.preciopormayor).toFixed(2)}
				</span>
			</div>

			{#if showUnitPrice}
				<div class="text-[10px] text-red-500 font-medium">
					20% descuento: Bs. {Number(product.precioUnidad).toFixed(2)}
				</div>
			{/if}
		</div>

		<div class="text-[11px] text-[#222] font-medium font-sans leading-tight">
			{showUnitPrice ? 'Precio por unidad' : `${product.moq || 12} unidades (MOQ)`}
		</div>

		<div class="relative h-4 overflow-hidden mt-auto w-full pt-1">
			{#key i}
				<div
					in:fly={{ y: 10, duration: 300 }}
					out:fly={{ y: -10, duration: 300 }}
					class="absolute inset-0 flex items-center w-full"
				>
					<span class="text-[9px] text-[#f2421e] font-bold leading-tight font-sans w-full truncate">
						{salesTags[i]}
					</span>
				</div>
			{/key}
		</div>
	</div>
</div>