import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { listarNotificaciones, marcarLeida, marcarTodasLeidas } from '../../api/notificaciones';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { fechaHora } from '../../utils/formato';
import { PaginaNotificaciones } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'Notificaciones'>;

export default function NotificacionesScreen({ navigation }: Props) {
  const [datos, setDatos] = useState<PaginaNotificaciones | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    listarNotificaciones().then(setDatos).catch((e) => setError(e.message));
  }, []);
  useFocusEffect(cargar);

  const todasLeidas = async () => { await marcarTodasLeidas(); cargar(); };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (datos && datos.noLeidas > 0 ? (
        <Pressable onPress={todasLeidas}><Text style={{ color: '#fff', fontWeight: '600' }}>Marcar leídas</Text></Pressable>
      ) : null),
    });
  });

  const abrir = async (id: number, leida: boolean, enlace: string | null) => {
    if (!leida) { await marcarLeida(id).catch(() => {}); cargar(); }
    const m = enlace?.match(/pedidos\/(\d+)/);
    if (m) navigation.navigate('PedidoDetalle', { id: Number(m[1]) });
  };

  if (error) return <MensajeVacio icono="cloud-offline-outline" titulo="No se pudieron cargar las notificaciones" detalle={error} />;
  if (!datos) return <Cargando />;

  return (
    <FlatList
      data={datos.notificaciones}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 12, flexGrow: 1 }}
      ListEmptyComponent={<MensajeVacio icono="notifications-off-outline" titulo="Sin notificaciones" detalle="Aquí verás el avance de tus pedidos y promociones." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => abrir(item.id, item.leida, item.enlace)} style={[styles.tarjeta, !item.leida && styles.noLeida]}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.mensaje}>{item.mensaje}</Text>
          <Text style={styles.fecha}>{fechaHora(item.fecha)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = crearEstilos(() => ({
  tarjeta: { backgroundColor: colores.superficie, borderRadius: radio, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  noLeida: { borderLeftWidth: 4, borderLeftColor: colores.primario, backgroundColor: colores.primarioClaro },
  titulo: { fontWeight: '700', color: colores.texto },
  mensaje: { color: colores.texto, marginTop: 4 },
  fecha: { color: colores.textoSuave, fontSize: 12, marginTop: 6 },
}));
