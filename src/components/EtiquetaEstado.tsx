import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EstadoPedido } from '../types';
import { colores } from '../theme/colores';

type Par = { fondo: string; texto: string };

function paleta(): Record<EstadoPedido, Par> {
  if (colores.oscuro) {
    const azul = { fondo: '#1A2B3F', texto: '#90CAF9' };
    return {
      PENDIENTE_PAGO: { fondo: '#3A3220', texto: '#F2D675' },
      PAGO_APROBADO: azul,
      CONFIRMADO: azul,
      EN_PREPARACION: { fondo: '#2A2340', texto: '#B39DDB' },
      DISPONIBLE_RECOJO: { fondo: colores.primarioClaro, texto: colores.primarioOscuro },
      ENTREGADO: { fondo: '#2B2F2B', texto: '#CFD8DC' },
      CANCELADO: { fondo: colores.errorClaro, texto: colores.error },
    };
  }
  const azul = { fondo: '#E3F2FD', texto: '#0D47A1' };
  return {
    PENDIENTE_PAGO: { fondo: '#FFF3CD', texto: '#8A6D00' },
    PAGO_APROBADO: azul,
    CONFIRMADO: azul,
    EN_PREPARACION: { fondo: '#EDE7F6', texto: '#4527A0' },
    DISPONIBLE_RECOJO: { fondo: colores.primarioClaro, texto: colores.primarioOscuro },
    ENTREGADO: { fondo: '#E0E0E0', texto: '#37474F' },
    CANCELADO: { fondo: colores.errorClaro, texto: colores.error },
  };
}

export default function EtiquetaEstado({ estado, texto }: { estado: EstadoPedido; texto: string }) {
  const c = paleta()[estado];
  return (
    <View style={[styles.caja, { backgroundColor: c.fondo }]}>
      <Text style={[styles.texto, { color: c.texto }]}>{texto}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  caja: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  texto: { fontSize: 12, fontWeight: '700' },
});
