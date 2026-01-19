<script lang="ts">
	import RowItem from '$lib/components/grid/RowItem.svelte';
	export let data;

	$: productos = data.allProducts || [];
	const categorias = [
		'todo', 'belleza y salud', 'herramientas', 'hogar y cocina',
		'infantil', 'moda y equipaje', 'oficina y escolar', 'tecnología'
	];

	let activeCat = 'todo';
</script>

<div class="flex flex-col gap-8">
	<div class="relative">
		<nav class="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar py-2 px-1 border-b border-gray-100">
			{#each categorias as cat}
				<button
					on:click={() => (activeCat = cat)}
					class="flex-shrink-0 text-[14px] pb-2 transition-all lowercase whitespace-nowrap
					{activeCat === cat ? 'text-[#ff4014] font-bold border-b-2 border-[#ff4014]' : 'text-[#222] font-normal border-b-2 border-transparent'}"
				>
					{cat}
				</button>
			{/each}
		</nav>
		<div class="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#f7f7f7] to-transparent pointer-events-none"></div>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
		{#each productos as product}
			{#if activeCat === 'todo' || product.category?.toLowerCase() === activeCat}
				<RowItem {product} />
			{/if}
		{/each}
	</div>
</div>