import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../theme/colores';
import { TabsParams } from './tipos';
import { useCarrito } from '../context/CarritoContext';
import InicioScreen from '../screens/catalogo/InicioScreen';
import CarritoScreen from '../screens/carrito/CarritoScreen';
import HistorialScreen from '../screens/pedidos/HistorialScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';

const Tab = createBottomTabNavigator<TabsParams>();
const iconos: Record<keyof TabsParams, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Inicio: ['storefront', 'storefront-outline'],
  Carrito: ['cart', 'cart-outline'],
  Pedidos: ['receipt', 'receipt-outline'],
  Perfil: ['person', 'person-outline'],
};

export default function ClienteTabs() {
  const { cantidad } = useCarrito();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colores.oscuro ? colores.primarioOscuro : colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={iconos[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Freshmart' }} />
      <Tab.Screen name="Carrito" component={CarritoScreen} options={{ title: 'Mi carrito', tabBarBadge: cantidad > 0 ? cantidad : undefined }} />
      <Tab.Screen name="Pedidos" component={HistorialScreen} options={{ title: 'Mis pedidos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Mi cuenta' }} />
    </Tab.Navigator>
  );
}
