import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { personalListar } from '../../api/pedidos';
import { useAuth } from '../../context/AuthContext';
import Cargando from '../../components/Cargando';
import EtiquetaEstado from '../../components/EtiquetaEstado';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { fechaHora, soles } from '../../utils/formato';
import { reportePedidosPdf } from '../../utils/pdf';
import Boton from '../../components/Boton';
import { EstadoPedido, PedidoResumen } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'PersonalPedidos'>;

const filtros: { valor: EstadoPedido | null; texto: string }[] = [
  { valor: null, texto: 'Todos' },
  { valor: 'PAGO_APROBADO', texto: 'Pago aprobado' },
  { valor: 'CONFIRMADO', texto: 'Confirmado' },
  { valor: 'EN_PREPARACION', texto: 'En preparación' },
  { valor: 'DISPONIBLE_RECOJO', texto: 'Para recojo' },
  { valor: 'ENTREGADO', texto: 'Entregado' },
];

export default function PersonalPedidosScreen({ navigation }: Props) {
  const { cerrarSesion } = useAuth();
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [pedidos, setPedidos] = useState<PedidoResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => Alert.alert('Cerrar sesión', '¿Salir de la cuenta del personal?', [
          { text: 'Cancelar', style: 'cancel' }, { text: 'Salir', onPress: cerrarSesion },
        ])}><Text style={{ color: '#fff', fontWeight: '600' }}>Salir</Text></Pressable>
      ),
    });
  }, [navigation, cerrarSesion]);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setPedidos((await personalListar(estado, 0, 50)).contenido);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRefrescando(false);
    }
  }, [estado]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {filtros.map((f) => (
            <Pressable key={f.texto} onPress={() => { setPedidos(null); setEstado(f.valor); }} style={[styles.chip, estado === f.valor && styles.chipActivo]}>
              <Text style={[styles.chipTexto, estado === f.valor && { color: '#fff' }]}>{f.texto}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {error && !pedidos ? <MensajeVacio icono="cloud-offline-outline" titulo="No se pudieron cargar los pedidos" detalle={error} accion="Reintentar" onAccion={cargar} /> :
        !pedidos ? <Cargando /> : (
          <FlatList
            data={pedidos}
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={{ padding: 12, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
            ListHeaderComponent={pedidos.length > 0 ? (
              <Boton titulo="Exportar reporte (PDF)" variante="secundario" estilo={{ marginBottom: 12 }}
                onPress={() => reportePedidosPdf({ titulo: 'Reporte de pedidos de la tienda', subtitulo: `Filtro: ${filtros.find((f) => f.valor === estado)?.texto}`, pedidos })
                  .catch((e) => Alert.alert('Reporte', e.message ?? 'No se pudo generar el PDF.'))} />
            ) : null}
            ListEmptyComponent={<MensajeVacio icono="receipt-outline" titulo="No hay pedidos en este estado" />}
            renderItem={({ item }) => (
              <Pressable style={styles.tarjeta} onPress={() => navigation.navigate('PersonalDetalle', { id: item.id })}>
                <View style={styles.fila}><Text style={styles.codigo}>{item.codigo}</Text><Text style={styles.total}>{soles(item.total)}</Text></View>
                <Text style={styles.dato}>{item.cliente} · {item.cantidad} producto(s)</Text>
                <Text style={styles.dato}>{fechaHora(item.fechaPedido)} · {item.tienda}</Text>
                <View style={{ marginTop: 8 }}><EtiquetaEstado estado={item.estado} texto={item.etiqueta} /></View>
              </Pressable>
            )}
          />
        )}
    </View>
  );
}

const styles = crearEstilos(() => ({
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { fontWeight: '600', fontSize: 13, color: colores.texto },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: radio, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  codigo: { fontWeight: '700', fontSize: 16 },
  total: { fontWeight: '800', color: colores.primarioOscuro },
  dato: { color: colores.textoSuave, fontSize: 13, marginTop: 3 },
}));
