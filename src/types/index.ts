export type Rol = 'CLIENTE' | 'PERSONAL';

export interface Usuario { id: number; nombres: string; apellidos: string; correo: string; rol: Rol; }
export interface LoginResponse { token: string; usuario: Usuario; }
export interface RegistroRequest {
  nombres: string; apellidos: string; correo: string; fechaNacimiento?: string | null;
  password: string; confirmarPassword: string;
}

export interface Tienda { id: number; nombre: string; direccion: string; telefono: string | null; horarioAtencion: string | null; }
export interface Categoria { id: number; nombre: string; descripcion: string; productos: number; }
export interface Producto {
  id: number; nombre: string; descripcion: string; precio: number; categoriaId: number; categoria: string;
  calificacion: number; imagenUrl: string | null; disponible: boolean; stock: number;
}
export interface Pagina<T> { contenido: T[]; pagina: number; tamanio: number; totalElementos: number; totalPaginas: number; }

export interface ItemCarrito { productoId: number; nombre: string; imagenUrl: string | null; precio: number; cantidad: number; subtotal: number; stock: number; }
export interface Carrito {
  items: ItemCarrito[]; cantidadTotal: number; tienda: Tienda | null;
  subtotal: number; impuestos: number; total: number; igv: number; moneda: string;
}

export type EstadoPedido =
  | 'PENDIENTE_PAGO' | 'PAGO_APROBADO' | 'CONFIRMADO' | 'EN_PREPARACION'
  | 'DISPONIBLE_RECOJO' | 'ENTREGADO' | 'CANCELADO';
export type MetodoPago = 'TARJETA' | 'YAPE';

export interface PagoRequest { metodo: MetodoPago; numeroTarjeta?: string; vencimiento?: string; cvv?: string; celular?: string; codigoYape?: string; }
export interface ItemPedido { productoId: number; nombreProducto: string; cantidad: number; precioUnitario: number; subtotal: number; }
export interface Pago { metodo: string; estado: string; codigoTransaccion: string; referencia: string; simulado: boolean; fechaPago: string; }
export interface Seguimiento { estado: string; etiqueta: string; fecha: string; }
export interface Pedido {
  id: number; codigo: string; fechaPedido: string; estado: EstadoPedido; etiqueta: string; tienda: Tienda;
  items: ItemPedido[]; subtotal: number; impuestos: number; total: number; moneda: string; pago: Pago | null;
  seguimiento: Seguimiento[]; indicaciones: string | null; cliente: string; pagado: boolean;
}
export interface ResultadoPago { aprobado: boolean; mensaje: string; pedido: Pedido; }
export interface PedidoResumen {
  id: number; codigo: string; fechaPedido: string; estado: EstadoPedido; etiqueta: string; tienda: string;
  cliente: string; cantidad: number; productos: string[]; total: number; pagado: boolean;
}
export interface ResumenHistorial { cantidadPedidos: number; totalComprado: number; pedidosEntregados: number; }

export interface Perfil {
  id: number; nombres: string; apellidos: string; correo: string; fechaNacimiento: string | null;
  telefono: string | null; rol: string; estado: string;
}
export interface PerfilRequest {
  nombres: string; apellidos: string; correo: string; fechaNacimiento: string | null; telefono: string | null; passwordActual?: string;
}
export interface Configuracion { notifPedidos: boolean; notifPromociones: boolean; notifCorreo: boolean; tema: 'CLARO' | 'OSCURO'; }
export interface Notificacion { id: number; tipo: string; titulo: string; mensaje: string; leida: boolean; fecha: string; enlace: string | null; }
export interface PaginaNotificaciones {
  notificaciones: Notificacion[]; noLeidas: number; pagina: number; tamanio: number; totalElementos: number; totalPaginas: number;
}
export interface PreguntaFrecuente { id: number; categoria: string; pregunta: string; respuesta: string; }
