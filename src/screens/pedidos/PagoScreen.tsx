import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { detallePedido, pagarPedido } from '../../api/pedidos';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Cargando from '../../components/Cargando';
import Pantalla, { Seccion } from '../../components/Pantalla';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { soles } from '../../utils/formato';
import { MetodoPago, PagoRequest, Pedido } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'Pago'>;

export default function PagoScreen({ route, navigation }: Props) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>('TARJETA');
  const [tarjeta, setTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoYape, setCodigoYape] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { detallePedido(pedidoId).then(setPedido).catch((e) => setError(e.message)); }, [pedidoId]);

  const formatearTarjeta = (t: string) => t.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatearVence = (t: string) => {
    const d = t.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const pagar = async () => {
    const datos: PagoRequest = metodo === 'TARJETA'
      ? { metodo, numeroTarjeta: tarjeta.replace(/\s/g, ''), vencimiento, cvv }
      : { metodo, celular, codigoYape };
    setError(null);
    setCargando(true);
    try {
      const r = await pagarPedido(pedidoId, datos);
      if (r.aprobado) {
        Alert.alert('¡Pago aprobado!', r.mensaje, [{ text: 'Ver pedido', onPress: () => navigation.replace('PedidoDetalle', { id: pedidoId }) }]);
      } else {
        setError(r.mensaje);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  if (!pedido) return error ? <Text style={styles.error}>{error}</Text> : <Cargando />;

  return (
    <Pantalla>
      <Seccion>
        <Text style={styles.titulo}>Pedido {pedido.codigo}</Text>
        <Text style={styles.dato}>Recojo en {pedido.tienda.nombre}</Text>
        <Text style={styles.total}>{soles(pedido.total)}</Text>
        <Text style={styles.dato}>Incluye IGV de {soles(pedido.impuestos)}</Text>
      </Seccion>

      <View style={styles.aviso}><Text style={styles.avisoTexto}>Pago simulado: no se realiza ningún cargo real.</Text></View>

      <View style={styles.metodos}>
        {(['TARJETA', 'YAPE'] as MetodoPago[]).map((m) => (
          <Pressable key={m} onPress={() => setMetodo(m)} style={[styles.metodo, metodo === m && styles.metodoActivo]}>
            <Text style={[styles.metodoTexto, metodo === m && { color: '#fff' }]}>{m === 'TARJETA' ? 'Tarjeta' : 'Yape'}</Text>
          </Pressable>
        ))}
      </View>

      {metodo === 'TARJETA' ? (
        <>
          <CampoTexto etiqueta="Número de tarjeta" value={tarjeta} onChangeText={(t) => setTarjeta(formatearTarjeta(t))} keyboardType="number-pad" placeholder="4111 1111 1111 1111" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><CampoTexto etiqueta="Vencimiento" value={vencimiento} onChangeText={(t) => setVencimiento(formatearVence(t))} keyboardType="number-pad" placeholder="MM/AA" /></View>
            <View style={{ flex: 1 }}><CampoTexto etiqueta="CVV" value={cvv} onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry /></View>
          </View>
        </>
      ) : (
        <>
          <CampoTexto etiqueta="Celular Yape" value={celular} onChangeText={(t) => setCelular(t.replace(/\D/g, '').slice(0, 9))} keyboardType="number-pad" placeholder="9XXXXXXXX" />
          <CampoTexto etiqueta="Código de aprobación (6 dígitos)" value={codigoYape} onChangeText={(t) => setCodigoYape(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo={`Pagar ${soles(pedido.total)}`} onPress={pagar} cargando={cargando} />
      <Boton titulo="Pagar más tarde" variante="secundario" onPress={() => navigation.replace('PedidoDetalle', { id: pedidoId })} estilo={{ marginTop: 10 }} />
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  dato: { color: colores.textoSuave, marginTop: 2 },
  total: { fontSize: 30, fontWeight: '800', color: colores.primarioOscuro, marginVertical: 6 },
  aviso: { backgroundColor: colores.aviso, padding: 10, borderRadius: radio, marginBottom: 14 },
  avisoTexto: { color: colores.avisoTexto, fontSize: 13 },
  metodos: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metodo: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: radio, borderWidth: 1.5, borderColor: colores.primario, backgroundColor: colores.superficie },
  metodoActivo: { backgroundColor: colores.primario },
  metodoTexto: { fontWeight: '700', color: colores.primario },
  error: { color: colores.error, marginBottom: 12, fontSize: 14 },
}));
