import { PRODUCTOS } from './datos';

// Imágenes de los productos del modo demo, por URL.
//
// Para usar TUS propias imágenes, pega la URL completa en IMAGENES_PROPIAS con el id del producto
// (el id es la posición en PRODUCTOS de src/demo/datos.ts, empezando en 1: Manzana = 1, Plátano = 2, ...).
// Ejemplo:  1: 'https://midominio.com/img/manzana.png',
//
// Los productos sin URL propia usan una foto de ejemplo según la palabra clave del producto
// (servicio loremflickr.com; requiere internet y la foto es referencial). Si una imagen no carga,
// la app muestra un ícono en su lugar.
export const IMAGENES_PROPIAS: Record<number, string> = {
  // 1: 'https://...',
};

export const imagenDemo = (productoId: number): string =>
  IMAGENES_PROPIAS[productoId] ??
  `https://loremflickr.com/400/300/${PRODUCTOS[productoId - 1]?.[5] ?? 'grocery'}?lock=${productoId}`;
