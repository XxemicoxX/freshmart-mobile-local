// "Servidor" simulado dentro de la app (modo demo). Replica las rutas del backend con datos locales
// guardados en AsyncStorage, para poder probar todo el flujo sin conexión ni base de datos.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorApi } from '../api/errores';
import { imagenDemo } from './imagenes';
import { CATEGORIAS, ETIQUETAS, FAQ, PRODUCTOS, TIENDAS, TRANSICIONES } from './datos';
import {
  Carrito, Configuracion, EstadoPedido, ItemCarrito, Notificacion, Pagina, PagoRequest, Pedido, PedidoResumen,
  Producto, Rol,
} from '../types';

const IGV = 0.18;
const CLAVE = 'freshmart_demo_db_v2';

interface UsuarioDb {
  id: number; nombres: string; apellidos: string; correo: string; rol: Rol; password: string;
  fechaNacimiento: string | null; telefono: string | null;
}
interface CarritoDb { tiendaId: number | null; items: { productoId: number; cantidad: number }[]; }
type PedidoDb = Pedido & { uid: number };
type NotifDb = Notificacion & { uid: number };
interface Db {
  sig: { usuario: number; pedido: number; notif: number };
  usuarios: UsuarioDb[];
  carritos: Record<number, CarritoDb>;
  configs: Record<number, Configuracion>;
  pedidos: PedidoDb[];
  notifs: NotifDb[];
  stock: Record<string, number>; // "productoId-tiendaId"
  recuperacion: Record<string, number>; // código -> usuario
}

export const CODIGO_RECUPERACION_DEMO = '123456';
export const CUENTAS_DEMO = {
  cliente: { correo: 'cliente@freshmart.pe', password: 'Cliente123' },
  personal: { correo: 'personal@freshmart.pe', password: 'Personal123' },
};

let db: Db | null = null;

function semilla(): Db {
  const stock: Record<string, number> = {};
  PRODUCTOS.forEach((_, i) => TIENDAS.forEach((t) => { stock[`${i + 1}-${t.id}`] = 50; }));
  const helado = PRODUCTOS.findIndex((x) => x[1].startsWith('Helado de vainilla')) + 1;
  stock[`${helado}-1`] = 0; // helado agotado en la tienda 1, como en el backend
  return {
    sig: { usuario: 3, pedido: 1, notif: 2 },
    usuarios: [
      { id: 1, nombres: 'Cliente', apellidos: 'Demo', correo: CUENTAS_DEMO.cliente.correo, rol: 'CLIENTE', password: CUENTAS_DEMO.cliente.password, fechaNacimiento: null, telefono: null },
      { id: 2, nombres: 'Personal', apellidos: 'Tienda', correo: CUENTAS_DEMO.personal.correo, rol: 'PERSONAL', password: CUENTAS_DEMO.personal.password, fechaNacimiento: null, telefono: null },
    ],
    carritos: {},
    configs: {},
    pedidos: [],
    notifs: [{
      id: 1, uid: 1, tipo: 'PROMOCION', titulo: 'Ofertas para tu primera compra',
      mensaje: 'Explora el catálogo y encuentra productos destacados para tu hogar.', leida: false, fecha: new Date().toISOString(), enlace: null,
    }],
    stock,
    recuperacion: {},
  };
}

async function cargar(): Promise<Db> {
  if (db) return db;
  try {
    const guardado = await AsyncStorage.getItem(CLAVE);
    db = guardado ? (JSON.parse(guardado) as Db) : semilla();
  } catch {
    db = semilla();
  }
  return db;
}
const guardar = () => AsyncStorage.setItem(CLAVE, JSON.stringify(db)).catch(() => {});

export async function reiniciarDemo() { db = semilla(); await guardar(); }

// ---------- utilidades ----------
const err = (estado: number, mensaje: string) => new ErrorApi(estado, mensaje);
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const ahora = () => new Date().toISOString();
const correoOk = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

function usuarioDe(token: string | null, d: Db): UsuarioDb {
  const m = token?.match(/^demo-(\d+)$/);
  const u = m ? d.usuarios.find((x) => x.id === Number(m[1])) : undefined;
  if (!u) throw err(401, 'Tu sesión no es válida o venció. Inicia sesión para continuar.');
  return u;
}
function exigirRol(u: UsuarioDb, rol: Rol) {
  if (u.rol !== rol) throw err(403, 'No tienes permiso para realizar esta acción.');
}
const stockDe = (d: Db, productoId: number, tiendaId: number | null) =>
  tiendaId ? d.stock[`${productoId}-${tiendaId}`] ?? 0 : Math.max(...TIENDAS.map((t) => d.stock[`${productoId}-${t.id}`] ?? 0));

function productoDto(d: Db, id: number, tiendaId: number | null): Producto {
  const p = PRODUCTOS[id - 1];
  if (!p) throw err(404, 'El producto no existe o no está disponible.');
  const stock = stockDe(d, id, tiendaId);
  return {
    id, nombre: p[1], descripcion: p[2], precio: p[3], categoriaId: p[0],
    categoria: CATEGORIAS.find((c) => c.id === p[0])!.nombre, calificacion: p[4],
    imagenUrl: imagenDemo(id), disponible: stock > 0, stock,
  };
}

function totales(subtotal: number) {
  const s = r2(subtotal), i = r2(s * IGV);
  return { subtotal: s, impuestos: i, total: r2(s + i) };
}

function carritoDto(d: Db, uid: number): Carrito {
  const c = d.carritos[uid] ?? { tiendaId: null, items: [] };
  const items: ItemCarrito[] = c.items.map((it) => {
    const p = productoDto(d, it.productoId, c.tiendaId);
    return { productoId: p.id, nombre: p.nombre, imagenUrl: p.imagenUrl, precio: p.precio, cantidad: it.cantidad, subtotal: r2(p.precio * it.cantidad), stock: p.stock };
  });
  const t = totales(items.reduce((a, i) => a + i.subtotal, 0));
  return {
    items, cantidadTotal: items.reduce((a, i) => a + i.cantidad, 0),
    tienda: TIENDAS.find((x) => x.id === c.tiendaId) ?? null, ...t, igv: IGV, moneda: 'PEN',
  };
}
const carritoDe = (d: Db, uid: number) => (d.carritos[uid] ??= { tiendaId: null, items: [] });

function validarCantidad(d: Db, uid: number, productoId: number, cantidad: number) {
  const c = carritoDe(d, uid);
  const p = productoDto(d, productoId, c.tiendaId);
  if (!Number.isInteger(cantidad) || cantidad < 1) throw err(400, 'La cantidad debe ser al menos 1.');
  if (cantidad > p.stock) throw err(409, p.stock === 0 ? `${p.nombre} está agotado en esta tienda.` : `Solo hay ${p.stock} unidades disponibles de ${p.nombre}.`);
}

function notificar(d: Db, uid: number, tipo: string, titulo: string, mensaje: string, enlace: string | null = null) {
  const cfg = d.configs[uid];
  if (tipo === 'PEDIDO' && cfg && !cfg.notifPedidos) return;
  d.notifs.push({ id: d.sig.notif++, uid, tipo, titulo, mensaje, leida: false, fecha: ahora(), enlace });
}

function resumen(p: PedidoDb): PedidoResumen {
  return {
    id: p.id, codigo: p.codigo, fechaPedido: p.fechaPedido, estado: p.estado, etiqueta: p.etiqueta, tienda: p.tienda.nombre,
    cliente: p.cliente, cantidad: p.items.reduce((a, i) => a + i.cantidad, 0), productos: p.items.map((i) => i.nombreProducto),
    total: p.total, pagado: p.pagado,
  };
}
const sinUid = ({ uid, ...p }: PedidoDb): Pedido => p;

function pagina<T>(lista: T[], pag: number, tam: number): Pagina<T> {
  return { contenido: lista.slice(pag * tam, pag * tam + tam), pagina: pag, tamanio: tam, totalElementos: lista.length, totalPaginas: Math.max(1, Math.ceil(lista.length / tam)) };
}

function cambiarEstado(d: Db, p: PedidoDb, nuevo: EstadoPedido, mensaje?: string) {
  p.estado = nuevo;
  p.etiqueta = ETIQUETAS[nuevo];
  p.seguimiento.push({ estado: nuevo, etiqueta: ETIQUETAS[nuevo], fecha: ahora() });
  if (nuevo === 'CANCELADO' && !p.pagado) {
    p.items.forEach((i) => { d.stock[`${i.productoId}-${p.tienda.id}`] += i.cantidad; });
  }
  notificar(d, p.uid, 'PEDIDO', `Tu pedido ${p.codigo}: ${ETIQUETAS[nuevo]}`, mensaje ?? `El estado de tu pedido ${p.codigo} cambió a "${ETIQUETAS[nuevo]}".`, `/pedidos/${p.id}`);
}

function simularPago(r: PagoRequest): { aprobado: boolean; mensaje: string; referencia: string } {
  const malo = (m: string) => err(400, m);
  if (r.metodo === 'TARJETA') {
    const n = (r.numeroTarjeta ?? '').replace(/[\s-]/g, '');
    if (!/^\d{16}$/.test(n)) throw malo('Ingresa los 16 dígitos de la tarjeta de prueba.');
    const m = (r.vencimiento ?? '').match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) throw malo('Ingresa el vencimiento con el formato MM/AA.');
    const hoy = new Date();
    if (2000 + Number(m[2]) < hoy.getFullYear() || (2000 + Number(m[2]) === hoy.getFullYear() && Number(m[1]) < hoy.getMonth() + 1))
      throw malo('La tarjeta de prueba está vencida. Usa una fecha vigente.');
    if (!/^\d{3,4}$/.test(r.cvv ?? '')) throw malo('Ingresa el código de seguridad de 3 o 4 dígitos.');
    const ref = '**** ' + n.slice(12);
    if (n.endsWith('0002')) return { aprobado: false, mensaje: 'El banco rechazó la tarjeta (simulación). Prueba con otra tarjeta o paga con Yape.', referencia: ref };
    if (n.endsWith('9995')) return { aprobado: false, mensaje: 'Fondos insuficientes (simulación). Prueba con otra tarjeta o paga con Yape.', referencia: ref };
    return { aprobado: true, mensaje: 'Pago aprobado (simulación).', referencia: ref };
  }
  if (!/^9\d{8}$/.test(r.celular ?? '')) throw malo('Ingresa tu número de celular Yape (9 dígitos, empieza con 9).');
  if (!/^\d{6}$/.test(r.codigoYape ?? '')) throw malo('Ingresa el código de aprobación de 6 dígitos.');
  const ref = '*****' + r.celular!.slice(6);
  if (r.codigoYape === '000000') return { aprobado: false, mensaje: 'Yape no aprobó el pago (simulación). Revisa el código o paga con tarjeta.', referencia: ref };
  return { aprobado: true, mensaje: 'Pago aprobado (simulación).', referencia: ref };
}

// ---------- despachador ----------
export async function peticionDemo(metodo: string, rutaCompleta: string, cuerpo: any, token: string | null): Promise<any> {
  const d = await cargar();
  const [ruta, qs = ''] = rutaCompleta.split('?');
  const q = new URLSearchParams(qs);
  const partes = ruta.split('/').filter(Boolean);
  const mutante = metodo !== 'GET';
  await new Promise((r) => setTimeout(r, 150)); // se siente como una red real
  const resultado = manejar(d, metodo, partes, q, cuerpo, token);
  if (mutante) await guardar();
  return resultado === undefined ? undefined : JSON.parse(JSON.stringify(resultado));
}

function manejar(d: Db, metodo: string, p: string[], q: URLSearchParams, cuerpo: any, token: string | null): any {
  const [modulo, a, b, c] = p;
  const ruta = `${metodo} ${modulo}`;

  // ----- públicas -----
  if (modulo === 'auth') {
    if (metodo === 'POST' && a === 'registro') {
      const f = cuerpo ?? {};
      if (!f.nombres?.trim() || !f.apellidos?.trim()) throw err(400, 'Completa tus nombres y apellidos.');
      if (!correoOk(f.correo ?? '')) throw err(400, 'Ingresa un correo válido.');
      if ((f.password ?? '').length < 8) throw err(400, 'La contraseña debe tener al menos 8 caracteres.');
      if (f.password !== f.confirmarPassword) throw err(400, 'Las contraseñas no coinciden. Vuelve a escribirlas.');
      if (d.usuarios.some((u) => u.correo.toLowerCase() === f.correo.trim().toLowerCase()))
        throw err(409, 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.');
      const id = d.sig.usuario++;
      d.usuarios.push({ id, nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), correo: f.correo.trim(), rol: 'CLIENTE', password: f.password, fechaNacimiento: f.fechaNacimiento || null, telefono: null });
      notificar(d, id, 'SISTEMA', '¡Bienvenido a Freshmart!', 'Tu cuenta fue creada. Ya puedes explorar el catálogo.');
      return undefined;
    }
    if (metodo === 'POST' && a === 'login') {
      const u = d.usuarios.find((x) => x.correo.toLowerCase() === (cuerpo?.correo ?? '').trim().toLowerCase() && x.password === cuerpo?.password);
      if (!u) throw err(401, 'Correo o contraseña incorrectos.');
      return { token: `demo-${u.id}`, usuario: { id: u.id, nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, rol: u.rol } };
    }
    if (metodo === 'POST' && a === 'recuperar') {
      const u = d.usuarios.find((x) => x.correo.toLowerCase() === (cuerpo?.correo ?? '').trim().toLowerCase());
      if (u) d.recuperacion[CODIGO_RECUPERACION_DEMO] = u.id;
      return undefined;
    }
    if (metodo === 'POST' && a === 'restablecer') {
      const uid = d.recuperacion[cuerpo?.token];
      const u = d.usuarios.find((x) => x.id === uid);
      if (!u) throw err(400, 'El código de recuperación no es válido o ya venció. Solicita uno nuevo.');
      if (cuerpo.password !== cuerpo.confirmarPassword) throw err(400, 'Las contraseñas no coinciden. Vuelve a escribirlas.');
      if ((cuerpo.password ?? '').length < 8) throw err(400, 'La contraseña debe tener al menos 8 caracteres.');
      u.password = cuerpo.password;
      delete d.recuperacion[cuerpo.token];
      return undefined;
    }
  }
  if (modulo === 'faq' && metodo === 'GET') return FAQ;
  if (modulo === 'tiendas' && metodo === 'GET') {
    if (!a) return TIENDAS;
    const t = TIENDAS.find((x) => x.id === Number(a));
    if (!t) throw err(404, 'La tienda no existe o no está disponible.');
    return t;
  }
  if (modulo === 'catalogo' && metodo === 'GET') {
    if (a === 'categorias') return CATEGORIAS.map((cat) => ({ ...cat, productos: PRODUCTOS.filter((x) => x[0] === cat.id).length }));
    if (a === 'productos' && !b) {
      const tiendaId = q.get('tiendaId') ? Number(q.get('tiendaId')) : null;
      const cat = q.get('categoriaId') ? Number(q.get('categoriaId')) : null;
      const texto = (q.get('q') ?? '').trim().toLowerCase();
      const lista = PRODUCTOS.map((_, i) => productoDto(d, i + 1, tiendaId))
        .filter((x) => (!cat || x.categoriaId === cat) && (!texto || x.nombre.toLowerCase().includes(texto)));
      return pagina(lista, Number(q.get('pagina') ?? 0), Number(q.get('tamanio') ?? 20));
    }
    if (a === 'productos' && b) return productoDto(d, Number(b), q.get('tiendaId') ? Number(q.get('tiendaId')) : null);
  }

  // ----- autenticadas -----
  const u = usuarioDe(token, d);

  if (modulo === 'usuario') {
    if (a === 'perfil' && metodo === 'GET')
      return { id: u.id, nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, fechaNacimiento: u.fechaNacimiento, telefono: u.telefono, rol: u.rol, estado: 'ACTIVO' };
    if (a === 'perfil' && metodo === 'PUT') {
      const f = cuerpo ?? {};
      if (!f.nombres?.trim() || !f.apellidos?.trim()) throw err(400, 'Completa tus nombres y apellidos.');
      if (!correoOk(f.correo ?? '')) throw err(400, 'Ingresa un correo válido.');
      const correo = f.correo.trim();
      if (correo.toLowerCase() !== u.correo.toLowerCase()) {
        if (f.passwordActual !== u.password) throw err(400, 'Para cambiar tu correo, ingresa tu contraseña actual correcta.');
        if (d.usuarios.some((x) => x.correo.toLowerCase() === correo.toLowerCase())) throw err(409, 'Ya existe una cuenta con ese correo. Usa otro correo.');
      }
      Object.assign(u, { nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), correo, fechaNacimiento: f.fechaNacimiento || null, telefono: f.telefono || null });
      return { id: u.id, nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, fechaNacimiento: u.fechaNacimiento, telefono: u.telefono, rol: u.rol, estado: 'ACTIVO' };
    }
    if (a === 'password' && metodo === 'PATCH') {
      if (cuerpo.passwordActual !== u.password) throw err(400, 'La contraseña actual es incorrecta.');
      if (cuerpo.passwordNueva !== cuerpo.confirmar) throw err(400, 'Las contraseñas nuevas no coinciden. Vuelve a escribirlas.');
      if (cuerpo.passwordNueva === cuerpo.passwordActual) throw err(400, 'La nueva contraseña debe ser distinta a la actual.');
      if ((cuerpo.passwordNueva ?? '').length < 8) throw err(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
      u.password = cuerpo.passwordNueva;
      return { mensaje: 'Tu contraseña se actualizó correctamente.', token: `demo-${u.id}` };
    }
    if (a === 'configuracion') {
      if (metodo === 'GET') return (d.configs[u.id] ??= { notifPedidos: true, notifPromociones: true, notifCorreo: false, tema: 'CLARO' });
      if (metodo === 'PUT') return (d.configs[u.id] = cuerpo);
    }
    if (!a && metodo === 'DELETE') {
      exigirRol(u, 'CLIENTE');
      if (cuerpo?.password !== u.password) throw err(400, 'La contraseña es incorrecta. No se eliminó tu cuenta.');
      const enCurso = d.pedidos.filter((x) => x.uid === u.id && !['ENTREGADO', 'CANCELADO'].includes(x.estado)).length;
      if (enCurso) throw err(409, `Tienes ${enCurso} pedido(s) en curso. Recógelos o espera a que la tienda los cierre antes de eliminar tu cuenta.`);
      d.usuarios = d.usuarios.filter((x) => x.id !== u.id);
      d.pedidos = d.pedidos.filter((x) => x.uid !== u.id);
      d.notifs = d.notifs.filter((x) => x.uid !== u.id);
      delete d.carritos[u.id];
      return undefined;
    }
  }

  if (modulo === 'notificaciones') {
    const cfg = d.configs[u.id];
    const mias = d.notifs.filter((n) => n.uid === u.id && !(n.tipo === 'PROMOCION' && cfg && !cfg.notifPromociones)).sort((x, y) => y.id - x.id);
    if (metodo === 'GET') {
      const lista = q.get('soloNoLeidas') === 'true' ? mias.filter((n) => !n.leida) : mias;
      const pag = pagina(lista, Number(q.get('pagina') ?? 0), Number(q.get('tamanio') ?? 20));
      return {
        notificaciones: pag.contenido.map(({ uid, ...n }) => n), noLeidas: mias.filter((n) => !n.leida).length,
        pagina: pag.pagina, tamanio: pag.tamanio, totalElementos: pag.totalElementos, totalPaginas: pag.totalPaginas,
      };
    }
    if (metodo === 'PATCH' && b === 'leida') {
      const n = mias.find((x) => x.id === Number(a));
      if (!n) throw err(404, 'La notificación no existe.');
      n.leida = true;
      return undefined;
    }
    if (metodo === 'PUT' && a === 'leidas') {
      let k = 0;
      mias.forEach((n) => { if (!n.leida) { n.leida = true; k++; } });
      return k;
    }
  }

  if (modulo === 'carrito') {
    exigirRol(u, 'CLIENTE');
    const cr = carritoDe(d, u.id);
    if (metodo === 'GET' && !a) return carritoDto(d, u.id);
    if (metodo === 'DELETE' && !a) { cr.items = []; return carritoDto(d, u.id); }
    if (a === 'productos') {
      const pid = Number(b);
      productoDto(d, pid, null);
      const existente = cr.items.find((i) => i.productoId === pid);
      if (metodo === 'POST') {
        const total = (existente?.cantidad ?? 0) + Number(cuerpo?.cantidad);
        validarCantidad(d, u.id, pid, total);
        if (existente) existente.cantidad = total; else cr.items.push({ productoId: pid, cantidad: total });
      } else if (metodo === 'PUT') {
        if (!existente) throw err(404, 'Ese producto no está en tu carrito.');
        validarCantidad(d, u.id, pid, Number(cuerpo?.cantidad));
        existente.cantidad = Number(cuerpo.cantidad);
      } else if (metodo === 'DELETE') {
        cr.items = cr.items.filter((i) => i.productoId !== pid);
      }
      return carritoDto(d, u.id);
    }
    if (a === 'tienda' && metodo === 'PUT') {
      const t = TIENDAS.find((x) => x.id === Number(b));
      if (!t) throw err(404, 'La tienda no existe o no está disponible.');
      const sin = cr.items.find((i) => stockDe(d, i.productoId, t.id) < i.cantidad);
      if (sin) throw err(409, `${PRODUCTOS[sin.productoId - 1][1]} no tiene stock suficiente en ${t.nombre}. Ajusta tu carrito o elige otra tienda.`);
      cr.tiendaId = t.id;
      return carritoDto(d, u.id);
    }
  }

  if (modulo === 'pedidos') {
    exigirRol(u, 'CLIENTE');
    const mios = d.pedidos.filter((x) => x.uid === u.id);
    const propio = (id: string) => {
      const x = mios.find((y) => y.id === Number(id));
      if (!x) throw err(404, 'No encontramos ese pedido.');
      return x;
    };
    if (metodo === 'POST' && !a) {
      const cr = carritoDe(d, u.id);
      if (!cr.items.length) throw err(400, 'Tu carrito está vacío.');
      if (!cr.tiendaId) throw err(400, 'Elige la tienda donde recogerás tu pedido.');
      const tienda = TIENDAS.find((t) => t.id === cr.tiendaId)!;
      cr.items.forEach((i) => validarCantidad(d, u.id, i.productoId, i.cantidad));
      const dto = carritoDto(d, u.id);
      cr.items.forEach((i) => { d.stock[`${i.productoId}-${tienda.id}`] -= i.cantidad; });
      const id = d.sig.pedido++;
      const fecha = ahora();
      const pedido: PedidoDb = {
        uid: u.id, id, codigo: `ORD-${1000 + id}`, fechaPedido: fecha, estado: 'PENDIENTE_PAGO', etiqueta: ETIQUETAS.PENDIENTE_PAGO, tienda,
        items: dto.items.map((i) => ({ productoId: i.productoId, nombreProducto: i.nombre, cantidad: i.cantidad, precioUnitario: i.precio, subtotal: i.subtotal })),
        subtotal: dto.subtotal, impuestos: dto.impuestos, total: dto.total, moneda: 'PEN', pago: null,
        seguimiento: [{ estado: 'PENDIENTE_PAGO', etiqueta: ETIQUETAS.PENDIENTE_PAGO, fecha }],
        indicaciones: null, cliente: `${u.nombres} ${u.apellidos}`, pagado: false,
      };
      d.pedidos.push(pedido);
      cr.items = [];
      notificar(d, u.id, 'PEDIDO', `Pedido ${pedido.codigo} creado`, `Completa el pago de S/ ${pedido.total.toFixed(2)} para confirmarlo.`, `/pedidos/${id}`);
      return sinUid(pedido);
    }
    if (metodo === 'POST' && b === 'pagar') {
      const ped = propio(a);
      if (ped.estado !== 'PENDIENTE_PAGO') throw err(409, 'Este pedido ya no admite pago.');
      const res = simularPago(cuerpo);
      if (!res.aprobado) return { aprobado: false, mensaje: res.mensaje, pedido: sinUid(ped) };
      ped.pago = {
        metodo: cuerpo.metodo, estado: 'APROBADO', referencia: res.referencia, simulado: true, fechaPago: ahora(),
        codigoTransaccion: `TXN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`,
      };
      ped.pagado = true;
      cambiarEstado(d, ped, 'PAGO_APROBADO');
      cambiarEstado(d, ped, 'CONFIRMADO', `Tu pago fue aprobado y tu pedido ${ped.codigo} fue confirmado. Total: S/ ${ped.total.toFixed(2)}. Te avisaremos cuando esté listo para recoger en ${ped.tienda.nombre}.`);
      return { aprobado: true, mensaje: `¡Pago aprobado! Tu pedido ${ped.codigo} fue confirmado.`, pedido: sinUid(ped) };
    }
    if (metodo === 'GET' && a === 'historial' && b === 'resumen') {
      const pagados = mios.filter((x) => x.pagado);
      return { cantidadPedidos: mios.length, totalComprado: r2(pagados.reduce((s, x) => s + x.total, 0)), pedidosEntregados: mios.filter((x) => x.estado === 'ENTREGADO').length };
    }
    if (metodo === 'GET' && a === 'historial')
      return pagina([...mios].sort((x, y) => y.id - x.id).map(resumen), Number(q.get('pagina') ?? 0), Number(q.get('tamanio') ?? 20));
    if (metodo === 'GET' && a && !b) return sinUid(propio(a));
    if (metodo === 'DELETE' && a) {
      const ped = propio(a);
      if (ped.estado !== 'PENDIENTE_PAGO') throw err(409, 'Solo puedes cancelar pedidos pendientes de pago. Si ya pagaste, comunícate con la tienda.');
      cambiarEstado(d, ped, 'CANCELADO');
      return sinUid(ped);
    }
  }

  if (modulo === 'personal' && a === 'pedidos') {
    exigirRol(u, 'PERSONAL');
    const visibles = d.pedidos.filter((x) => x.estado !== 'PENDIENTE_PAGO');
    if (metodo === 'GET' && !b) {
      const est = q.get('estado');
      const lista = visibles.filter((x) => !est || x.estado === est).sort((x, y) => y.id - x.id).map(resumen);
      return pagina(lista, Number(q.get('pagina') ?? 0), Number(q.get('tamanio') ?? 20));
    }
    const ped = visibles.find((x) => x.id === Number(b));
    if (!ped) throw err(404, 'No encontramos ese pedido.');
    if (metodo === 'GET') return sinUid(ped);
    if (metodo === 'PATCH' && c === 'estado') {
      const nuevo = cuerpo?.estado as EstadoPedido;
      if (!TRANSICIONES[ped.estado]?.includes(nuevo))
        throw err(409, `No se puede pasar de "${ped.etiqueta}" a "${ETIQUETAS[nuevo] ?? nuevo}".`);
      cambiarEstado(d, ped, nuevo);
      return sinUid(ped);
    }
  }

  throw err(404, `Ruta no disponible en modo demo: ${ruta}${a ? '/' + a : ''}`);
}
