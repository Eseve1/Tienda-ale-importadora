<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	export let product: any;

	const dispatch = createEventDispatcher();

	// --- ESTRATEGIA: GEOLOCALIZACIÓN BOLIVIA + VOLUMEN DE VENTAS ---
	const salesTags = [
		"📦 +1 docena vendida hoy",
		"🔥 +5 docenas vendidas hoy",
		"🚀 +2 docenas despachadas ",
		"🇧🇴 Envíos a los 9 departamentos",
		"🚚 Saliendo carga a La Paz",
		"🏔️ Alta rotación en El Alto",
		"🍇 Pedido frecuente en Tarija",
		"🌴 Envío listo para Trinidad - Beni",
		"🌰 Despacho a Riberalta",
		"🚤 Ruta activa a Rurrenabaque",
		"🌞 Envíos a Cobija - Pando",
		"🦕 Saliendo pedido a Sucre",
		"💎 Top ventas en Cochabamba",
		"⛏️ Envíos diarios a Potosí y Oruro",
		"✅ Stock verificado por Ale",
		"⚡ Salida diaria de mercadería"
	];

	let index = 0;
	let interval: any;

	onMount(() => {
		// Retraso aleatorio para que las tarjetas no cambien todas igual
		const delay = Math.random() * 2000;
		setTimeout(() => {
			interval = setInterval(() => {
				index = (index + 1) % salesTags.length;
			}, 3500);
		}, delay);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	// Accesibilidad: Manejo de teclado (Enter/Espacio) para evitar warnings
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			dispatch('select', product);
		}
	}
</script>

<div
	class="group relative bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-1 hover:shadow-xl hover:border-[#f2421e]/30 transition-all duration-300 cursor-pointer overflow-hidden font-sans h-full"
	on:click={() => dispatch('select', product)}
	on:keydown={handleKeydown}
	role="button"
	tabindex="0"
>
	{#if !product.disponible}
		<div class="absolute top-0 right-0 z-20 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl shadow-sm">
			Agotado
		</div>
	{/if}

	<div class="aspect-square w-full rounded-xl overflow-hidden flex items-center justify-center relative p-1 mb-1">
		<img
			src={product.imagen}
			alt={product.descripcion}
			loading="lazy"
			class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
		/>
	</div>

	<div class="flex flex-col flex-1 gap-0.5">

		<h3 class="font-sans font-normal text-[#222] text-[14px] leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-[#f2421e] transition-colors capitalize">
			{product.descripcion.toLowerCase()}
		</h3>

		<div class="flex items-start gap-0.5 mt-0.5 text-[#222] group-hover:text-[#f2421e] transition-colors duration-200">
			<span class="text-[12px] font-bold mt-1.5">Bs.</span>
			<span class="font-sans font-bold text-2xl leading-none">
				{Number(product.preciopormayor).toFixed(2)}
			</span>
		</div>

		<div class="text-[12px] text-[#222] font-normal leading-tight font-sans mt-1">
			Cantidad mínima: {product.moq} unidades
		</div>

		<div class="relative h-5 overflow-hidden mt-1.5 w-full">
			{#key index}
				<div
					in:fly={{ y: 10, duration: 300 }}
					out:fly={{ y: -10, duration: 300 }}
					class="absolute inset-0 flex items-center w-full"
				>
					<span class="text-[11px] text-[#f2421e] font-medium leading-tight font-sans w-full truncate">
						{salesTags[index]}
					</span>
				</div>
			{/key}
		</div>

	</div>
</div>