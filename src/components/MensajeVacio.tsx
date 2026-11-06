import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, crearEstilos } from '../theme/colores';
import Boton from './Boton';

interface Props { icono?: keyof typeof Ionicons.glyphMap; titulo: string; detalle?: string; accion?: string; onAccion?: () => void; }

export default function MensajeVacio({ icono = 'leaf-outline', titulo, detalle, accion, onAccion }: Props) {
  return (
    <View style={styles.centro}>
      <Ionicons name={icono} size={56} color={colores.textoSuave} />
      <Text style={styles.titulo}>{titulo}</Text>
      {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      {accion && onAccion ? <Boton titulo={accion} onPress={onAccion} estilo={{ marginTop: 16, alignSelf: 'stretch' }} /> : null}
    </View>
  );
}
const styles = crearEstilos(() => ({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  titulo: { fontSize: 18, fontWeight: '700', color: colores.texto, marginTop: 12, textAlign: 'center' },
  detalle: { fontSize: 14, color: colores.textoSuave, marginTop: 6, textAlign: 'center' },
}));
