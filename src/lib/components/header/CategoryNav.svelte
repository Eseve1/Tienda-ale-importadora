<script lang="ts">
	// Aquí podrías cargar las categorías de tu base de datos Appwrite
	// Por ahora pondremos las típicas de mayorista para el ejemplo
	const categorias = [
		{ name: "🔥 Ofertas", slug: "ofertas", active: true },
		{ name: "⌚ Relojes", slug: "relojes" },
		{ name: "🎧 Audio", slug: "audio" },
		{ name: "🏠 Hogar", slug: "hogar" },
		{ name: "🧸 Juguetes", slug: "juguetes" },
		{ name: "💄 Belleza", slug: "belleza" },
		{ name: "📱 Accesorios", slug: "accesorios" },
		{ name: "🎒 Mochilas", slug: "mochilas" }
	];
</script>

<div class="w-full bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
	<div class="flex overflow-x-auto py-3 px-4 gap-3 no-scrollbar items-center">

		{#each categorias as cat}
			<a
				href={`/category/${cat.slug}`}
				class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border
                {cat.active
                    ? 'bg-[#fb7701] text-white border-[#fb7701] shadow-md'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}"
			>
				{cat.name}
			</a>
		{/each}

	</div>
</div>

<style>
    /* Ocultar barra de scroll pero permitir deslizar */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>