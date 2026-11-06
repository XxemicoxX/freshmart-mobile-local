import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL, ErrorApi, MODO_DEMO, http, obtenerToken } from './cliente';
import { boletaPdf } from '../utils/pdf';
import { EstadoPedido, Pagina, PagoRequest, Pedido, PedidoResumen, ResultadoPago, ResumenHistorial } from '../types';

export const crearPedido = () => http.post<Pedido>('/pedidos');
export const pagarPedido = (id: number, pago: PagoRequest) => http.post<ResultadoPago>(`/pedidos/${id}/pagar`, pago);
export const historial = (pagina = 0, tamanio = 20) => http.get<Pagina<PedidoResumen>>(`/pedidos/historial?pagina=${pagina}&tamanio=${tamanio}`);
export const resumenHistorial = () => http.get<ResumenHistorial>('/pedidos/historial/resumen');
export const detallePedido = (id: number) => http.get<Pedido>(`/pedidos/${id}`);
export const cancelarPedido = (id: number) => http.delete<Pedido>(`/pedidos/${id}`);

export async function descargarBoleta(pedido: Pedido) {
  if (MODO_DEMO) return boletaPdf(pedido); // en modo demo el PDF se genera en el celular
  const destino = `${FileSystem.cacheDirectory}boleta-${pedido.codigo}.pdf`;
  const r = await FileSystem.downloadAsync(`${API_URL}/pedidos/${pedido.id}/boleta`, destino, {
    headers: { Authorization: `Bearer ${obtenerToken()}` },
  });
  if (r.status !== 200) throw new ErrorApi(r.status, 'No se pudo descargar la boleta. Inténtalo de nuevo.');
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(r.uri, { mimeType: 'application/pdf', dialogTitle: 'Boleta Freshmart' });
}

// Personal de tienda
export function personalListar(estado?: EstadoPedido | null, pagina = 0, tamanio = 20) {
  const q = estado ? `&estado=${estado}` : '';
  return http.get<Pagina<PedidoResumen>>(`/personal/pedidos?pagina=${pagina}&tamanio=${tamanio}${q}`);
}
export const personalDetalle = (id: number) => http.get<Pedido>(`/personal/pedidos/${id}`);
export const personalCambiarEstado = (id: number, estado: EstadoPedido) => http.patch<Pedido>(`/personal/pedidos/${id}/estado`, { estado });
