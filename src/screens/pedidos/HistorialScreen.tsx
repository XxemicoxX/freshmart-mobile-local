import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { historial, resumenHistorial } from '../../api/pedidos';
import Cargando from '../../components/Cargando';
import EtiquetaEstado from '../../components/EtiquetaEstado';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { fechaHora, soles } from '../../utils/formato';
import { PedidoResumen, ResumenHistorial } from '../../types';

export default function HistorialScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const [pedidos, setPedidos] = useState<PedidoResumen[] | null>(null);
  const [resumen, setResumen] = useState<ResumenHistorial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const [h, r] = await Promise.all([historial(0, 50), resumenHistorial()]);
      setPedidos(h.contenido);
      setResumen(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (error && !pedidos) return <MensajeVacio icono="cloud-offline-outline" titulo="No se pudo cargar tu historial" detalle={error} accion="Reintentar" onAccion={cargar} />;
  if (!pedidos) return <Cargando />;

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      data={pedidos}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={{ padding: 12, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      ListHeaderComponent={resumen ? (
        <View style={styles.resumen}>
          <Dato valor={String(resumen.cantidadPedidos)} etiqueta="Pedidos" />
          <Dato valor={String(resumen.pedidosEntregados)} etiqueta="Entregados" />
          <Dato valor={soles(resumen.totalComprado)} etiqueta="Total comprado" />
        </View>
      ) : null}
      ListEmptyComponent={<MensajeVacio icono="receipt-outline" titulo="Aún no tienes pedidos" detalle="Cuando compres, aparecerán aquí." />}
      renderItem={({ item }) => (
        <Pressable style={styles.tarjeta} onPress={() => nav.navigate('PedidoDetalle', { id: item.id })}>
          <View style={styles.fila}>
            <Text style={styles.codigo}>{item.codigo}</Text>
            <Text style={styles.total}>{soles(item.total)}</Text>
          </View>
          <Text style={styles.dato}>{fechaHora(item.fechaPedido)} · {item.tienda}</Text>
          <Text style={styles.dato} numberOfLines={1}>{item.productos.join(', ')}</Text>
          <View style={{ marginTop: 8 }}><EtiquetaEstado estado={item.estado} texto={item.etiqueta} /></View>
        </Pressable>
      )}
    />
  );
}

const Dato = ({ valor, etiqueta }: { valor: string; etiqueta: string }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={styles.resumenValor}>{valor}</Text>
    <Text style={styles.resumenEtiqueta}>{etiqueta}</Text>
  </View>
);

const styles = crearEstilos(() => ({
  resumen: { flexDirection: 'row', backgroundColor: colores.primarioClaro, borderRadius: radio, padding: 14, marginBottom: 12 },
  resumenValor: { fontSize: 18, fontWeight: '800', color: colores.primarioOscuro },
  resumenEtiqueta: { fontSize: 12, color: colores.textoSuave },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: radio, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  codigo: { fontWeight: '700', fontSize: 16, color: colores.texto },
  total: { fontWeight: '800', color: colores.primarioOscuro },
  dato: { color: colores.textoSuave, fontSize: 13, marginTop: 3 },
}));
