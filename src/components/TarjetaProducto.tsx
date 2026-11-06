import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagenProducto from './ImagenProducto';
import { colores, radio, crearEstilos } from '../theme/colores';
import { soles } from '../utils/formato';
import { Producto } from '../types';

interface Props { producto: Producto; onPress: () => void; onAgregar: () => void; }

export default function TarjetaProducto({ producto, onPress, onAgregar }: Props) {
  return (
    <Pressable style={styles.tarjeta} onPress={onPress}>
      <ImagenProducto url={producto.imagenUrl} estilo={styles.imagen} />
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>{producto.nombre}</Text>
        <Text style={styles.categoria}>{producto.categoria}</Text>
        <View style={styles.fila}>
          <Text style={styles.precio}>{soles(producto.precio)}</Text>
          <Pressable
            onPress={onAgregar}
            disabled={!producto.disponible}
            style={[styles.agregar, !producto.disponible && { backgroundColor: colores.borde }]}
            accessibilityLabel={`Agregar ${producto.nombre} al carrito`}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
        {!producto.disponible ? <Text style={styles.agotado}>Agotado</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = crearEstilos(() => ({
  tarjeta: { flex: 1, backgroundColor: colores.superficie, borderRadius: radio, margin: 6, overflow: 'hidden', borderWidth: 1, borderColor: colores.borde },
  imagen: { width: '100%', height: 110, backgroundColor: colores.primarioClaro },
  sinImagen: { alignItems: 'center', justifyContent: 'center' },
  info: { padding: 10 },
  nombre: { fontSize: 14, fontWeight: '600', color: colores.texto, minHeight: 36 },
  categoria: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  precio: { fontSize: 16, fontWeight: '700', color: colores.primarioOscuro },
  agregar: { backgroundColor: colores.primario, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  agotado: { color: colores.error, fontSize: 12, marginTop: 4 },
}));
