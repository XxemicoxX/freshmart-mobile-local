import { http } from './cliente';
import { Carrito } from '../types';

export const verCarrito = () => http.get<Carrito>('/carrito');
export const agregarAlCarrito = (productoId: number, cantidad: number) => http.post<Carrito>(`/carrito/productos/${productoId}`, { cantidad });
export const actualizarCantidad = (productoId: number, cantidad: number) => http.put<Carrito>(`/carrito/productos/${productoId}`, { cantidad });
export const quitarDelCarrito = (productoId: number) => http.delete<Carrito>(`/carrito/productos/${productoId}`);
export const vaciarCarrito = () => http.delete<Carrito>('/carrito');
export const seleccionarTienda = (tiendaId: number) => http.put<Carrito>(`/carrito/tienda/${tiendaId}`);
