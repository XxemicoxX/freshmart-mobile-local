import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { detalleProducto } from '../../api/catalogo';
import { useCarrito } from '../../context/CarritoContext';
import ImagenProducto from '../../components/ImagenProducto';
import Boton from '../../components/Boton';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, crearEstilos } from '../../theme/colores';
import { soles } from '../../utils/formato';
import { Producto } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'Producto'>;

export default function ProductoScreen({ route, navigation }: Props) {
  const { agregar } = useCarrito();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    detalleProducto(route.params.id).then(setProducto).catch((e) => setError(e.message));
  }, [route.params.id]);

  if (error) return <MensajeVacio icono="alert-circle-outline" titulo="No se pudo cargar el producto" detalle={error} />;
  if (!producto) return <Cargando />;

  const añadir = async () => {
    setAgregando(true);
    try {
      await agregar(producto.id, cantidad);
      Alert.alert('Agregado', `${cantidad} × ${producto.nombre} en tu carrito.`, [
        { text: 'Seguir comprando', onPress: () => navigation.goBack() },
        { text: 'Ver carrito', onPress: () => navigation.navigate('Tabs', { screen: 'Carrito' }) },
      ]);
    } catch (e: any) {
      Alert.alert('No se pudo agregar', e.message);
    } finally {
      setAgregando(false);
    }
  };

  const maximo = Math.max(producto.stock, 1);

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }}>
      <ImagenProducto url={producto.imagenUrl} estilo={styles.imagen} tamanioIcono={64} />
      <View style={styles.cuerpo}>
        <Text style={styles.categoria}>{producto.categoria}</Text>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <View style={styles.fila}>
          <Ionicons name="star" size={16} color={colores.acento} />
          <Text style={styles.calificacion}>{Number(producto.calificacion).toFixed(1)}</Text>
        </View>
        <Text style={styles.precio}>{soles(producto.precio)}</Text>
        <Text style={styles.descripcion}>{producto.descripcion}</Text>
        <Text style={[styles.stock, !producto.disponible && { color: colores.error }]}>
          {producto.disponible ? `${producto.stock} unidades disponibles` : 'Producto agotado en esta tienda'}
        </Text>

        {producto.disponible ? (
          <>
            <View style={styles.selector}>
              <Boton titulo="−" variante="secundario" onPress={() => setCantidad(Math.max(1, cantidad - 1))} estilo={styles.botonCantidad} />
              <Text style={styles.cantidad}>{cantidad}</Text>
              <Boton titulo="+" variante="secundario" onPress={() => setCantidad(Math.min(maximo, cantidad + 1))} estilo={styles.botonCantidad} />
            </View>
            <Boton titulo={`Agregar · ${soles(producto.precio * cantidad)}`} onPress={añadir} cargando={agregando} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = crearEstilos(() => ({
  imagen: { width: '100%', height: 260, backgroundColor: colores.primarioClaro },
  sinImagen: { alignItems: 'center', justifyContent: 'center' },
  cuerpo: { padding: 20 },
  categoria: { color: colores.primario, fontWeight: '700', fontSize: 13 },
  nombre: { fontSize: 24, fontWeight: '800', color: colores.texto, marginTop: 4 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  calificacion: { color: colores.textoSuave },
  precio: { fontSize: 28, fontWeight: '800', color: colores.primarioOscuro, marginTop: 12 },
  descripcion: { fontSize: 15, color: colores.texto, marginTop: 12, lineHeight: 22 },
  stock: { marginTop: 12, color: colores.textoSuave, marginBottom: 16 },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 },
  botonCantidad: { width: 52 },
  cantidad: { fontSize: 22, fontWeight: '700', minWidth: 30, textAlign: 'center' },
}));