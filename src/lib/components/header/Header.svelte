<script lang="ts">
	import CartSheet from '$lib/components/cart/CartSheet.svelte';
	import { name } from '../../../routes/store';
</script>

<header class="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">

		<a href="/" class="flex items-center gap-2 group hover:opacity-80 transition-opacity">
			<div class="bg-[#D32F2F] text-white p-1.5 rounded-md">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
			</div>

			<div class="flex flex-col leading-none">
				<span class="font-black text-lg tracking-tight text-gray-900 uppercase">ALE</span>
				<span class="text-[10px] font-bold text-gray-500 tracking-widest uppercase">IMPORTADORA</span>
			</div>
		</a>

		<div class="flex items-center">
			<CartSheet />
		</div>

	</div>
</header>