import { http } from './cliente';
import { Categoria, Pagina, Producto, Tienda, PreguntaFrecuente } from '../types';

export const listarCategorias = () => http.get<Categoria[]>('/catalogo/categorias');

export function listarProductos(p: { categoriaId?: number | null; q?: string; tiendaId?: number | null; pagina?: number; tamanio?: number }) {
  const params = new URLSearchParams();
  if (p.categoriaId) params.set('categoriaId', String(p.categoriaId));
  if (p.q) params.set('q', p.q);
  if (p.tiendaId) params.set('tiendaId', String(p.tiendaId));
  params.set('pagina', String(p.pagina ?? 0));
  params.set('tamanio', String(p.tamanio ?? 20));
  return http.get<Pagina<Producto>>(`/catalogo/productos?${params.toString()}`);
}

export const detalleProducto = (id: number, tiendaId?: number | null) =>
  http.get<Producto>(`/catalogo/productos/${id}${tiendaId ? `?tiendaId=${tiendaId}` : ''}`);

export const listarTiendas = () => http.get<Tienda[]>('/tiendas');
export const listarFaq = () => http.get<PreguntaFrecuente[]>('/faq');
