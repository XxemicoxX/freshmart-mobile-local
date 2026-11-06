import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { fechaHora, soles } from './formato';
import { Pedido, PedidoResumen, ResumenHistorial } from '../types';

const esc = (t: string | number | null | undefined) =>
  String(t ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const estilos = `
  body{font-family:Helvetica,Arial,sans-serif;color:#1F2933;padding:24px;font-size:13px}
  h1{color:#2E7D32;margin:0 0 4px} h2{margin:0 0 12px;font-size:15px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#E8F5E9;text-align:left} th,td{border:1px solid #ccc;padding:6px}
  .r{text-align:right} .nota{color:#6B7280;font-size:11px;margin-top:18px}
  p{margin:3px 0}
`;

async function compartirPdf(html: string, nombreArchivo: string) {
  const { uri } = await Print.printToFileAsync({ html });
  const destino = `${FileSystem.cacheDirectory}${nombreArchivo}.pdf`;
  await FileSystem.deleteAsync(destino, { idempotent: true });
  await FileSystem.moveAsync({ from: uri, to: destino });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destino, { mimeType: 'application/pdf', dialogTitle: nombreArchivo, UTI: 'com.adobe.pdf' });
  }
}

/** Boleta generada en el celular (modo demo). */
export function boletaPdf(p: Pedido) {
  const filas = p.items.map((i) =>
    `<tr><td>${esc(i.nombreProducto)}</td><td class="r">${i.cantidad}</td><td class="r">${i.precioUnitario.toFixed(2)}</td><td class="r">${i.subtotal.toFixed(2)}</td></tr>`).join('');
  const html = `<html><head><meta charset="utf-8"><style>${estilos}</style></head><body>
    <h1>FRESHMART S.A.C.</h1><h2>Boleta de venta electrónica B001-${esc(p.codigo.replace('ORD-', '0000'))}</h2>
    <p><b>Pedido:</b> ${esc(p.codigo)}</p><p><b>Fecha de compra:</b> ${fechaHora(p.fechaPedido)}</p>
    <p><b>Cliente:</b> ${esc(p.cliente)}</p>
    <p><b>Tienda de recojo:</b> ${esc(p.tienda.nombre)} - ${esc(p.tienda.direccion)}</p>
    <p><b>Método de pago:</b> ${p.pago?.metodo === 'YAPE' ? 'Yape' : 'Tarjeta de crédito/débito'} (${esc(p.pago?.referencia)})</p>
    <p><b>Código de transacción:</b> ${esc(p.pago?.codigoTransaccion)}</p>
    <table><tr><th>Producto</th><th class="r">Cant.</th><th class="r">P. unit. (S/)</th><th class="r">Subtotal (S/)</th></tr>${filas}</table>
    <p class="r" style="margin-top:12px">Subtotal: ${soles(p.subtotal)}</p>
    <p class="r">IGV (18%): ${soles(p.impuestos)}</p>
    <p class="r"><b>TOTAL: ${soles(p.total)}</b></p>
    <p class="nota">Documento generado por un sistema de demostración. Pago simulado, sin validez tributaria.</p>
  </body></html>`;
  return compartirPdf(html, `boleta-${p.codigo}`);
}

/** Reporte de pedidos (historial del cliente o listado del personal). */
export function reportePedidosPdf(opts: { titulo: string; subtitulo: string; pedidos: PedidoResumen[]; resumen?: ResumenHistorial | null }) {
  const filas = opts.pedidos.map((p) =>
    `<tr><td>${esc(p.codigo)}</td><td>${fechaHora(p.fechaPedido)}</td><td>${esc(p.tienda)}</td><td>${esc(p.cliente)}</td><td>${esc(p.etiqueta)}</td><td class="r">${p.total.toFixed(2)}</td></tr>`).join('');
  const suma = opts.pedidos.filter((p) => p.pagado).reduce((a, p) => a + p.total, 0);
  const r = opts.resumen;
  const html = `<html><head><meta charset="utf-8"><style>${estilos}</style></head><body>
    <h1>FRESHMART S.A.C.</h1><h2>${esc(opts.titulo)}</h2>
    <p>${esc(opts.subtitulo)}</p><p>Generado el ${fechaHora(new Date().toISOString())}</p>
    <p><b>Pedidos:</b> ${r ? r.cantidadPedidos : opts.pedidos.length} &nbsp; <b>Entregados:</b> ${r ? r.pedidosEntregados : opts.pedidos.filter((p) => p.estado === 'ENTREGADO').length}
       &nbsp; <b>Total pagado:</b> ${soles(r ? r.totalComprado : suma)}</p>
    <table><tr><th>Código</th><th>Fecha</th><th>Tienda</th><th>Cliente</th><th>Estado</th><th class="r">Total (S/)</th></tr>${filas || '<tr><td colspan="6">Sin pedidos</td></tr>'}</table>
    <p class="nota">Reporte generado por un sistema de demostración. Pagos simulados.</p>
  </body></html>`;
  return compartirPdf(html, `reporte-${opts.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
}
