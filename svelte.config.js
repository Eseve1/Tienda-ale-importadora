import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			'@/*': './path/to/lib/*'
		},
		// Ahora usa adapter-auto, que es el ideal para Vercel
		adapter: adapter()
	}
};

export default config;