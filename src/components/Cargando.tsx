import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colores, crearEstilos } from '../theme/colores';

export default function Cargando() {
  return <View style={styles.centro}><ActivityIndicator size="large" color={colores.primario} /></View>;
}
const styles = crearEstilos(() => ({ centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 } }));
