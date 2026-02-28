import { writable } from 'svelte/store';

// Definimos la estructura del carrito
interface CartItem {
	product: any;
	quantity: number;
	price: number;
}

interface CartState {
	items: CartItem[];
	isOpen: boolean;
	total: number;
	count: number;
}

// Estado inicial
const initialState: CartState = {
	items: [],
	isOpen: false,
	total: 0,
	count: 0
};

function createCart() {
	const { subscribe, update, set } = writable(initialState);

	// Calcular totales automáticamente
	const recalcular = (items: CartItem[], isOpen: boolean) => {
		return {
			items,
			isOpen,
			total: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
			count: items.reduce((sum, i) => sum + i.quantity, 0)
		};
	};

	return {
		subscribe,

		// Abrir/Cerrar
		setIsOpen: (isOpen: boolean) => update(s => ({ ...s, isOpen })),

		// Añadir producto
		add: (product: any, quantity: number, tipoPrecio: 'mayorista' | 'unidad') => update(s => {
			const existing = s.items.find(i => i.product.$id === product.$id);
			let newItems;
			// Usamos el precio según el tipo seleccionado
			const price = tipoPrecio === 'mayorista' ? product.preciopormayor : product.precioUnidad;

			if (existing) {
				newItems = s.items.map(i =>
					i.product.$id === product.$id
						? { ...i, quantity: i.quantity + quantity }
						: i
				);
			} else {
				newItems = [...s.items, { product, quantity, price }];
			}
			return recalcular(newItems, s.isOpen); // NO fuerza apertura
		}),

		// Actualizar cantidad
		updateQuantity: (productId: string, delta: number) => update(s => {
			const newItems = s.items.map(i => {
				if (i.product.$id === productId) {
					return { ...i, quantity: Math.max(1, i.quantity + delta) };
				}
				return i;
			});
			return recalcular(newItems, s.isOpen);
		}),

		// Eliminar producto
		remove: (productId: string) => update(s => {
			const newItems = s.items.filter(i => i.product.$id !== productId);
			return recalcular(newItems, s.isOpen);
		}),

		// Vaciar carrito
		clear: () => set(initialState)
	};
}

export const cart = createCart();