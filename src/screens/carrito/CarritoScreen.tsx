import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { useCarrito } from '../../context/CarritoContext';
import { crearPedido } from '../../api/pedidos';
import ImagenProducto from '../../components/ImagenProducto';
import Boton from '../../components/Boton';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { soles } from '../../utils/formato';
import { ItemCarrito } from '../../types';

export default function CarritoScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { carrito, recargar, cambiarCantidad, quitar, vaciar } = useCarrito();
  const [procesando, setProcesando] = useState(false);

  useFocusEffect(useCallback(() => { recargar(); }, [recargar]));

  const intentar = async (accion: () => Promise<void>) => {
    try { await accion(); } catch (e: any) { Alert.alert('Carrito', e.message); }
  };

  const confirmarVaciar = () =>
    Alert.alert('Vaciar carrito', '¿Quieres quitar todos los productos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: () => intentar(vaciar) },
    ]);

  const finalizar = async () => {
    if (!carrito?.tienda) return nav.navigate('SeleccionTienda', { desdeCarrito: true });
    setProcesando(true);
    try {
      const pedido = await crearPedido();
      await recargar();
      nav.navigate('Pago', { pedidoId: pedido.id });
    } catch (e: any) {
      Alert.alert('No se pudo crear el pedido', e.message);
    } finally {
      setProcesando(false);
    }
  };

  if (!carrito || carrito.items.length === 0) {
    return <MensajeVacio icono="cart-outline" titulo="Tu carrito está vacío" detalle="Agrega productos desde el catálogo." accion="Ir al catálogo" onAccion={() => nav.navigate('Tabs', { screen: 'Inicio' })} />;
  }

  const renderItem = ({ item }: { item: ItemCarrito }) => (
    <View style={styles.item}>
      <ImagenProducto url={item.imagenUrl} estilo={styles.foto} tamanioIcono={24} />
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre} numberOfLines={2}>{item.nombre}</Text>
        <Text style={styles.precio}>{soles(item.precio)}</Text>
        <View style={styles.cantidadFila}>
          <Pressable style={styles.mas} onPress={() => intentar(() => item.cantidad > 1 ? cambiarCantidad(item.productoId, item.cantidad - 1) : quitar(item.productoId))}>
            <Ionicons name={item.cantidad > 1 ? 'remove' : 'trash-outline'} size={18} color={colores.primario} />
          </Pressable>
          <Text style={styles.cantidad}>{item.cantidad}</Text>
          <Pressable style={styles.mas} onPress={() => intentar(() => cambiarCantidad(item.productoId, item.cantidad + 1))}>
            <Ionicons name="add" size={18} color={colores.primario} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.subtotal}>{soles(item.subtotal)}</Text>
    </View>
  );

  return (
    <View style={styles.fondo}>
      <FlatList
        data={carrito.items}
        keyExtractor={(i) => String(i.productoId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ListHeaderComponent={
          <Pressable style={styles.tienda} onPress={() => nav.navigate('SeleccionTienda', { desdeCarrito: true })}>
            <Ionicons name="location-outline" size={18} color={colores.primarioOscuro} />
            <Text style={styles.tiendaTexto}>{carrito.tienda ? `Recojo en ${carrito.tienda.nombre}` : 'Elige la tienda de recojo'}</Text>
            <Text style={styles.cambiar}>{carrito.tienda ? 'Cambiar' : 'Elegir'}</Text>
          </Pressable>
        }
        ListFooterComponent={<Pressable onPress={confirmarVaciar} style={{ alignItems: 'center', padding: 12 }}><Text style={{ color: colores.error, fontWeight: '600' }}>Vaciar carrito</Text></Pressable>}
      />
      <View style={styles.resumen}>
        <Fila etiqueta="Subtotal" valor={soles(carrito.subtotal)} />
        <Fila etiqueta={`IGV (${Math.round(carrito.igv * 100)}%)`} valor={soles(carrito.impuestos)} />
        <Fila etiqueta="Total" valor={soles(carrito.total)} grande />
        <Boton titulo={carrito.tienda ? 'Continuar al pago' : 'Elegir tienda y continuar'} onPress={finalizar} cargando={procesando} estilo={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

function Fila({ etiqueta, valor, grande }: { etiqueta: string; valor: string; grande?: boolean }) {
  return (
    <View style={styles.filaResumen}>
      <Text style={[styles.resumenTexto, grande && styles.resumenGrande]}>{etiqueta}</Text>
      <Text style={[styles.resumenTexto, grande && styles.resumenGrande]}>{valor}</Text>
    </View>
  );
}

const styles = crearEstilos(() => ({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  tienda: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: radio, backgroundColor: colores.primarioClaro, marginBottom: 10 },
  tiendaTexto: { flex: 1, color: colores.primarioOscuro, fontWeight: '600' },
  cambiar: { color: colores.primario, fontWeight: '700' },
  item: { flexDirection: 'row', gap: 12, backgroundColor: colores.superficie, padding: 10, borderRadius: radio, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  foto: { width: 70, height: 70, borderRadius: 8 },
  nombre: { fontWeight: '600', color: colores.texto },
  precio: { color: colores.textoSuave, marginTop: 2 },
  cantidadFila: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  mas: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colores.primario, alignItems: 'center', justifyContent: 'center' },
  cantidad: { fontWeight: '700', fontSize: 16 },
  subtotal: { fontWeight: '700', color: colores.primarioOscuro },
  resumen: { backgroundColor: colores.superficie, padding: 16, borderTopWidth: 1, borderTopColor: colores.borde },
  filaResumen: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resumenTexto: { color: colores.texto, fontSize: 15 },
  resumenGrande: { fontSize: 18, fontWeight: '800' },
}));
