import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../api/cliente';
import { colores, crearEstilos } from '../theme/colores';

/** Si el backend devuelve una ruta relativa (/img/arroz.png) se completa con el host del servidor. */
const resolver = (url: string) => (url.startsWith('/') ? API_URL.replace(/\/api\/v1\/?$/, '') + url : url);

interface Props { url: string | null; estilo: StyleProp<ImageStyle>; tamanioIcono?: number; }

export default function ImagenProducto({ url, estilo, tamanioIcono = 32 }: Props) {
  const [fallo, setFallo] = useState(false);
  if (!url || fallo) {
    return (
      <View style={[estilo as any, styles.vacio]}>
        <Ionicons name="image-outline" size={tamanioIcono} color={colores.textoSuave} />
      </View>
    );
  }
  return <Image source={{ uri: resolver(url) }} style={estilo} resizeMode="cover" onError={() => setFallo(true)} />;
}

const styles = crearEstilos(() => ({ vacio: { backgroundColor: colores.primarioClaro, alignItems: 'center', justifyContent: 'center' } }));
