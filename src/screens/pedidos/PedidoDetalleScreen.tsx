import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { cancelarPedido, descargarBoleta, detallePedido } from '../../api/pedidos';
import Boton from '../../components/Boton';
import Cargando from '../../components/Cargando';
import EtiquetaEstado from '../../components/EtiquetaEstado';
import MensajeVacio from '../../components/MensajeVacio';
import Pantalla, { Seccion } from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { fechaHora, soles } from '../../utils/formato';
import { Pedido } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'PedidoDetalle'>;

export default function PedidoDetalleScreen({ route, navigation }: Props) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(() => {
    detallePedido(route.params.id).then(setPedido).catch((e) => setError(e.message));
  }, [route.params.id]);
  useFocusEffect(cargar);

  if (error) return <MensajeVacio icono="alert-circle-outline" titulo="No se pudo cargar el pedido" detalle={error} />;
  if (!pedido) return <Cargando />;

  const puedeCancelar = pedido.estado === 'PENDIENTE_PAGO';

  const cancelar = () =>
    Alert.alert('Cancelar pedido', '¿Seguro que quieres cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          setOcupado(true);
          try { setPedido(await cancelarPedido(pedido.id)); } catch (e: any) { Alert.alert('No se pudo cancelar', e.message); }
          finally { setOcupado(false); }
        },
      },
    ]);

  const boleta = async () => {
    setOcupado(true);
    try { await descargarBoleta(pedido); } catch (e: any) { Alert.alert('Boleta', e.message); }
    finally { setOcupado(false); }
  };

  return (
    <Pantalla>
      <Seccion>
        <Text style={styles.codigo}>{pedido.codigo}</Text>
        <Text style={styles.dato}>{fechaHora(pedido.fechaPedido)}</Text>
        <View style={{ marginTop: 8 }}><EtiquetaEstado estado={pedido.estado} texto={pedido.etiqueta} /></View>
      </Seccion>

      <Seccion>
        <Text style={styles.subtitulo}>Recojo en tienda</Text>
        <Text style={styles.texto}>{pedido.tienda.nombre}</Text>
        <Text style={styles.dato}>{pedido.tienda.direccion}</Text>
        {pedido.tienda.horarioAtencion ? <Text style={styles.dato}>{pedido.tienda.horarioAtencion}</Text> : null}
      </Seccion>

      <Seccion>
        <Text style={styles.subtitulo}>Productos</Text>
        {pedido.items.map((i) => (
          <View key={i.productoId} style={styles.fila}>
            <Text style={[styles.texto, { flex: 1 }]}>{i.cantidad} × {i.nombreProducto}</Text>
            <Text style={styles.texto}>{soles(i.subtotal)}</Text>
          </View>
        ))}
        <View style={styles.separador} />
        <View style={styles.fila}><Text style={styles.dato}>Subtotal</Text><Text style={styles.dato}>{soles(pedido.subtotal)}</Text></View>
        <View style={styles.fila}><Text style={styles.dato}>IGV</Text><Text style={styles.dato}>{soles(pedido.impuestos)}</Text></View>
        <View style={styles.fila}><Text style={styles.total}>Total</Text><Text style={styles.total}>{soles(pedido.total)}</Text></View>
      </Seccion>

      {pedido.pago ? (
        <Seccion>
          <Text style={styles.subtitulo}>Pago</Text>
          <Text style={styles.texto}>{pedido.pago.metodo} · {pedido.pago.referencia}</Text>
          <Text style={styles.dato}>Transacción {pedido.pago.codigoTransaccion}{pedido.pago.simulado ? ' (simulada)' : ''}</Text>
        </Seccion>
      ) : null}

      <Seccion>
        <Text style={styles.subtitulo}>Seguimiento</Text>
        {pedido.seguimiento.map((s, idx) => (
          <View key={idx} style={styles.fila}>
            <Text style={styles.texto}>• {s.etiqueta}</Text>
            <Text style={styles.dato}>{fechaHora(s.fecha)}</Text>
          </View>
        ))}
      </Seccion>

      {pedido.estado === 'PENDIENTE_PAGO' ? <Boton titulo="Pagar ahora" onPress={() => navigation.navigate('Pago', { pedidoId: pedido.id })} estilo={{ marginBottom: 10 }} /> : null}
      {pedido.pagado ? <Boton titulo="Descargar boleta (PDF)" variante="secundario" onPress={boleta} cargando={ocupado} estilo={{ marginBottom: 10 }} /> : null}
      {puedeCancelar ? <Boton titulo="Cancelar pedido" variante="peligro" onPress={cancelar} deshabilitado={ocupado} /> : null}
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  codigo: { fontSize: 20, fontWeight: '800', color: colores.texto },
  subtitulo: { fontSize: 13, fontWeight: '700', color: colores.primario, marginBottom: 6, textTransform: 'uppercase' },
  texto: { color: colores.texto, fontSize: 15 },
  dato: { color: colores.textoSuave, fontSize: 13, marginTop: 2 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, gap: 8 },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: 8 },
  total: { fontSize: 17, fontWeight: '800', color: colores.primarioOscuro, marginTop: 4 },
}));
