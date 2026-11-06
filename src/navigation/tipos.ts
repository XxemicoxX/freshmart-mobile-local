import { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParams = { Inicio: undefined; Carrito: undefined; Pedidos: undefined; Perfil: undefined };

export type RootParams = {
  // Autenticación
  Login: undefined;
  Registro: undefined;
  Recuperar: undefined;
  Restablecer: { token?: string } | undefined;
  // Cliente
  Tabs: NavigatorScreenParams<TabsParams>;
  Producto: { id: number };
  Pago: { pedidoId?: number } | undefined;
  PedidoDetalle: { id: number };
  Notificaciones: undefined;
  EditarPerfil: undefined;
  CambiarPassword: undefined;
  Configuracion: undefined;
  Faq: undefined;
  EliminarCuenta: undefined;
  // Personal de tienda
  PersonalPedidos: undefined;
  PersonalDetalle: { id: number };
};