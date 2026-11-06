import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colores, radio, crearEstilos } from '../theme/colores';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
}

export default function Boton({ titulo, onPress, variante = 'primario', cargando, deshabilitado, estilo }: Props) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [styles.base, styles[variante], inactivo && styles.inactivo, pressed && { opacity: 0.85 }, estilo]}
    >
      {cargando ? <ActivityIndicator color={variante === 'secundario' ? colores.primario : '#fff'} /> :
        <Text style={[styles.texto, variante === 'secundario' && { color: colores.primario }]}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = crearEstilos(() => ({
  base: { minHeight: 48, borderRadius: radio, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primario: { backgroundColor: colores.primario },
  secundario: { backgroundColor: colores.superficie, borderWidth: 1.5, borderColor: colores.primario },
  peligro: { backgroundColor: colores.error },
  inactivo: { opacity: 0.55 },
  texto: { color: '#fff', fontSize: 16, fontWeight: '600' },
}));
