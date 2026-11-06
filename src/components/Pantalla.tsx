import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { colores, crearEstilos } from '../theme/colores';

/** Contenedor con scroll y teclado, para pantallas de formulario. */
export default function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.fondo} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export const Seccion = ({ children }: { children: React.ReactNode }) => <View style={styles.seccion}>{children}</View>;

const styles = crearEstilos(() => ({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, paddingBottom: 40 },
  seccion: { backgroundColor: colores.superficie, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colores.borde },
}));
