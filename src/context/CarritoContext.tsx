import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/carrito';
import { useAuth } from './AuthContext';
import { Carrito } from '../types';

interface CarritoContextoTipo {
  carrito: Carrito | null;
  cantidad: number;
  recargar: () => Promise<void>;
  agregar: (productoId: number, cantidad?: number) => Promise<void>;
  cambiarCantidad: (productoId: number, cantidad: number) => Promise<void>;
  quitar: (productoId: number) => Promise<void>;
  vaciar: () => Promise<void>;
  elegirTienda: (tiendaId: number) => Promise<void>;
}

const CarritoContext = createContext<CarritoContextoTipo>(null as unknown as CarritoContextoTipo);
export const useCarrito = () => useContext(CarritoContext);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const esCliente = usuario?.rol === 'CLIENTE';

  const recargar = useCallback(async () => {
    if (!esCliente) { setCarrito(null); return; }
    try { setCarrito(await api.verCarrito()); } catch { /* se muestra vacío */ }
  }, [esCliente]);

  useEffect(() => { recargar(); }, [recargar]);

  const envolver = (fn: () => Promise<Carrito>) => async () => { setCarrito(await fn()); };

  return (
    <CarritoContext.Provider value={{
      carrito,
      cantidad: carrito?.cantidadTotal ?? 0,
      recargar,
      agregar: (id, c = 1) => envolver(() => api.agregarAlCarrito(id, c))(),
      cambiarCantidad: (id, c) => envolver(() => api.actualizarCantidad(id, c))(),
      quitar: (id) => envolver(() => api.quitarDelCarrito(id))(),
      vaciar: envolver(api.vaciarCarrito),
      elegirTienda: (t) => envolver(() => api.seleccionarTienda(t))(),
    }}>
      {children}
    </CarritoContext.Provider>
  );
}
