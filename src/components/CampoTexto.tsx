import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colores, radio, crearEstilos } from '../theme/colores';

interface Props extends TextInputProps { etiqueta: string; error?: string | null; }

export default function CampoTexto({ etiqueta, error, style, ...resto }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor={colores.textoSuave}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...resto}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = crearEstilos(() => ({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.texto, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colores.borde, borderRadius: radio, backgroundColor: colores.superficie,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colores.texto,
  },
  inputError: { borderColor: colores.error },
  error: { color: colores.error, fontSize: 13, marginTop: 4 },
}));
