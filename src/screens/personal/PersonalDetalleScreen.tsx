import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { personalCambiarEstado, personalDetalle } from '../../api/pedidos';
import Boton from '../../components/Boton';
import Cargando from '../../components/Cargando';
import EtiquetaEstado from '../../components/EtiquetaEstado';
import MensajeVacio from '../../components/MensajeVacio';
import Pantalla, { Seccion } from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { fechaHora, soles } from '../../utils/formato';
import { EstadoPedido, Pedido } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'PersonalDetalle'>;

// Transiciones permitidas por el backend (EstadoPedido.puedePasarA)
const siguientes: Record<EstadoPedido, { estado: EstadoPedido; texto: string; peligro?: boolean }[]> = {
  PENDIENTE_PAGO: [],
  PAGO_APROBADO: [{ estado: 'CONFIRMADO', texto: 'Confirmar pedido' }, { estado: 'CANCELADO', texto: 'Cancelar', peligro: true }],
  CONFIRMADO: [{ estado: 'EN_PREPARACION', texto: 'Iniciar preparación' }, { estado: 'CANCELADO', texto: 'Cancelar', peligro: true }],
  EN_PREPARACION: [{ estado: 'DISPONIBLE_RECOJO', texto: 'Marcar disponible para recojo' }],
  DISPONIBLE_RECOJO: [{ estado: 'ENTREGADO', texto: 'Marcar como entregado' }],
  ENTREGADO: [],
  CANCELADO: [],
};

export default function PersonalDetalleScreen({ route }: Props) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => { personalDetalle(route.params.id).then(setPedido).catch((e) => setError(e.message)); }, [route.params.id]);

  if (error) return <MensajeVacio icono="alert-circle-outline" titulo="No se pudo cargar el pedido" detalle={error} />;
  if (!pedido) return <Cargando />;

  const cambiar = async (estado: EstadoPedido) => {
    setOcupado(true);
    try { setPedido(await personalCambiarEstado(pedido.id, estado)); }
    catch (e: any) { Alert.alert('No se pudo cambiar el estado', e.message); }
    finally { setOcupado(false); }
  };

  return (
    <Pantalla>
      <Seccion>
        <Text style={styles.codigo}>{pedido.codigo}</Text>
        <Text style={styles.dato}>Cliente: {pedido.cliente}</Text>
        <Text style={styles.dato}>{fechaHora(pedido.fechaPedido)} · {pedido.tienda.nombre}</Text>
        <View style={{ marginTop: 8 }}><EtiquetaEstado estado={pedido.estado} texto={pedido.etiqueta} /></View>
      </Seccion>
      <Seccion>
        {pedido.items.map((i) => (
          <View key={i.productoId} style={styles.fila}>
            <Text style={{ flex: 1, color: colores.texto }}>{i.cantidad} × {i.nombreProducto}</Text>
            <Text style={{ color: colores.texto }}>{soles(i.subtotal)}</Text>
          </View>
        ))}
        <View style={[styles.fila, { marginTop: 8 }]}><Text style={styles.total}>Total</Text><Text style={styles.total}>{soles(pedido.total)}</Text></View>
      </Seccion>
      {siguientes[pedido.estado].map((a) => (
        <Boton key={a.estado} titulo={a.texto} variante={a.peligro ? 'peligro' : 'primario'} onPress={() => cambiar(a.estado)} deshabilitado={ocupado} estilo={{ marginBottom: 10 }} />
      ))}
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  codigo: { fontSize: 20, fontWeight: '800' },
  dato: { color: colores.textoSuave, marginTop: 2 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, gap: 8 },
  total: { fontSize: 17, fontWeight: '800', color: colores.primarioOscuro },
}));
