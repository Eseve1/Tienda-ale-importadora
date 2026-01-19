import { writable } from 'svelte/store';

// Solo necesitamos el almacén y la bandera de "listo"
export const allProducts = writable<any[]>([]);
export const isLoaded = writable(false);

// Función auxiliar para normalizar texto (para las búsquedas)
export function normalizarTexto(txt: string) {
	return (txt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}