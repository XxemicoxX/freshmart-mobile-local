import React, { useEffect } from 'react';
import { View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colores } from '../theme/colores';
import { RootParams } from './tipos';
import { useAuth } from '../context/AuthContext';
import Cargando from '../components/Cargando';
import ClienteTabs from './ClienteTabs';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';
import RecuperarScreen from '../screens/auth/RecuperarScreen';
import RestablecerScreen from '../screens/auth/RestablecerScreen';
import ProductoScreen from '../screens/catalogo/ProductoScreen';
import SeleccionTiendaScreen from '../screens/carrito/SeleccionTiendaScreen';
import PagoScreen from '../screens/pedidos/PagoScreen';
import PedidoDetalleScreen from '../screens/pedidos/PedidoDetalleScreen';
import NotificacionesScreen from '../screens/notificaciones/NotificacionesScreen';
import EditarPerfilScreen from '../screens/perfil/EditarPerfilScreen';
import CambiarPasswordScreen from '../screens/perfil/CambiarPasswordScreen';
import ConfiguracionScreen from '../screens/perfil/ConfiguracionScreen';
import EliminarCuentaScreen from '../screens/perfil/EliminarCuentaScreen';
import FaqScreen from '../screens/ayuda/FaqScreen';
import PersonalPedidosScreen from '../screens/personal/PersonalPedidosScreen';
import PersonalDetalleScreen from '../screens/personal/PersonalDetalleScreen';

const Stack = createNativeStackNavigator<RootParams>();
// Se conserva el estado de navegación para que al cambiar el tema (se vuelve a dibujar la app) no se pierda la pantalla actual
let estadoNavegacion: any;

export default function AppNavigator() {
  const { usuario, cargando } = useAuth();
  useEffect(() => { estadoNavegacion = undefined; }, [usuario?.id]);
  if (cargando) return <View style={{ flex: 1, backgroundColor: colores.fondo }}><Cargando /></View>;

  const opciones = {
    headerStyle: { backgroundColor: colores.primario },
    headerTintColor: '#fff',
    contentStyle: { backgroundColor: colores.fondo },
  };
  const temaNav = {
    ...DefaultTheme,
    dark: colores.oscuro,
    colors: {
      primary: colores.primario, background: colores.fondo, card: colores.superficie,
      text: colores.texto, border: colores.borde, notification: colores.error,
    },
  };

  return (
    <NavigationContainer theme={temaNav} initialState={estadoNavegacion} onStateChange={(e) => { estadoNavegacion = e; }}>
      <Stack.Navigator screenOptions={opciones}>
        {!usuario ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: 'Crear cuenta' }} />
            <Stack.Screen name="Recuperar" component={RecuperarScreen} options={{ title: 'Recuperar contraseña' }} />
            <Stack.Screen name="Restablecer" component={RestablecerScreen} options={{ title: 'Nueva contraseña' }} />
          </>
        ) : usuario.rol === 'PERSONAL' ? (
          <>
            <Stack.Screen name="PersonalPedidos" component={PersonalPedidosScreen} options={{ title: 'Pedidos de la tienda' }} />
            <Stack.Screen name="PersonalDetalle" component={PersonalDetalleScreen} options={{ title: 'Detalle del pedido' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={ClienteTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Producto" component={ProductoScreen} options={{ title: 'Producto' }} />
            <Stack.Screen name="SeleccionTienda" component={SeleccionTiendaScreen} options={{ title: 'Elige tu tienda' }} />
            <Stack.Screen name="Pago" component={PagoScreen} options={{ title: 'Pago' }} />
            <Stack.Screen name="PedidoDetalle" component={PedidoDetalleScreen} options={{ title: 'Detalle del pedido' }} />
            <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ title: 'Notificaciones' }} />
            <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar perfil' }} />
            <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} options={{ title: 'Cambiar contraseña' }} />
            <Stack.Screen name="Configuracion" component={ConfiguracionScreen} options={{ title: 'Configuración' }} />
            <Stack.Screen name="EliminarCuenta" component={EliminarCuentaScreen} options={{ title: 'Eliminar cuenta' }} />
            <Stack.Screen name="Faq" component={FaqScreen} options={{ title: 'Preguntas frecuentes' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
