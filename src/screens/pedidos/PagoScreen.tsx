import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { crearPedido, detallePedido, pagarPedido } from '../../api/pedidos';
import { listarTiendas } from '../../api/catalogo';
import { useCarrito } from '../../context/CarritoContext';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Cargando from '../../components/Cargando';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos, radio } from '../../theme/colores';
import { soles } from '../../utils/formato';
import { MetodoPago, PagoRequest, Pedido, Tienda } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'Pago'>;

export default function PagoScreen({ route, navigation }: Props) {
  const pedidoIdInicial = route.params?.pedidoId;
  const { carrito, recargar, elegirTienda } = useCarrito();
  const [tiendaSel, setTiendaSel] = useState<Tienda | null>(null); // empieza sin seleccionar, como pide el diseño

  const [pedido, setPedido] = useState<Pedido | null>(null); // existe si se paga un pedido pendiente o tras el primer intento
  const [cargandoPedido, setCargandoPedido] = useState(!!pedidoIdInicial);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago | null>(null);
  const [tarjeta, setTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoYape, setCodigoYape] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { listarTiendas().then(setTiendas).catch(() => {}); }, []);
  useEffect(() => {
    if (pedidoIdInicial) detallePedido(pedidoIdInicial).then(setPedido).catch((e) => setError(e.message)).finally(() => setCargandoPedido(false));
  }, [pedidoIdInicial]);

  // Con el pedido ya creado la tienda queda fija; antes de crearlo se puede cambiar
  const tienda: Tienda | null = pedido ? pedido.tienda : tiendaSel;
  const total = pedido ? pedido.total : carrito?.total ?? 0;
  const tiendaBloqueada = !!pedido;

  const elegir = async (t: Tienda) => {
    setAbierto(false);
    try { await elegirTienda(t.id); setTiendaSel(t); setError(null); } catch (e: any) { Alert.alert('No se pudo elegir la tienda', e.message); }
  };

  const formatearTarjeta = (t: string) => t.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatearVence = (t: string) => {
    const d = t.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const pagar = async () => {
    if (!tienda) return setError('Selecciona la tienda donde recogerás tu pedido.');
    if (!metodo) return setError('Elige un método de pago.');
    const datos: PagoRequest = metodo === 'TARJETA'
      ? { metodo, numeroTarjeta: tarjeta.replace(/\s/g, ''), vencimiento, cvv }
      : { metodo, celular, codigoYape };
    setError(null);
    setCargando(true);
    try {
      let actual = pedido;
      if (!actual) { // el pedido se crea recién al pagar, con la tienda elegida aquí
        actual = await crearPedido();
        setPedido(actual);
        await recargar();
      }
      const r = await pagarPedido(actual.id, datos);
      if (r.aprobado) {
        Alert.alert('¡Pago aprobado!', r.mensaje, [{ text: 'Ver pedido', onPress: () => navigation.replace('PedidoDetalle', { id: actual!.id }) }]);
      } else {
        setError(r.mensaje);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoPedido) return <Cargando />;
  if (!pedido && (!carrito || carrito.items.length === 0)) {
    return <View style={styles.vacio}><Text style={styles.vacioTexto}>No tienes productos por pagar.</Text></View>;
  }

  return (
    <Pantalla>
      <View style={styles.monto}>
        <View style={styles.montoIcono}><Ionicons name="wallet-outline" size={26} color="#fff" /></View>
        <View>
          <Text style={styles.montoEtiqueta}>Monto total</Text>
          <Text style={styles.montoValor}>{soles(total)}</Text>
        </View>
      </View>

      <View style={styles.etiquetaFila}>
        <Text style={styles.etiqueta}>Tienda de recojo <Text style={{ color: colores.error }}>*</Text></Text>
        <Text style={styles.requerido}>Campo requerido</Text>
      </View>
      <Pressable style={[styles.combo, tiendaBloqueada && { opacity: 0.7 }]} onPress={() => !tiendaBloqueada && setAbierto(true)} accessibilityRole="combobox">
        <Ionicons name="location-outline" size={20} color={colores.primario} />
        <Text style={[styles.comboTexto, !tienda && { color: colores.textoSuave }]} numberOfLines={1}>{tienda ? tienda.nombre : 'Selecciona una tienda'}</Text>
        <Ionicons name="chevron-down" size={20} color={colores.textoSuave} />
      </Pressable>
      <Text style={styles.ayuda}>
        {tienda ? `Tu pedido estará listo para recoger en ${tienda.direccion}.` : 'Tu pedido estará listo para recoger en la tienda que elijas.'}
      </Text>

      <Text style={styles.seccion}>Método de pago</Text>
      <Text style={styles.aviso}>Pago simulado: no se realiza ningún cargo real.</Text>
      <Pressable onPress={() => setMetodo('TARJETA')} style={[styles.metodo, { backgroundColor: colores.primario }, metodo === 'YAPE' && styles.metodoApagado]}>
        <Ionicons name="card-outline" size={22} color="#fff" />
        <Text style={styles.metodoTexto}>Tarjeta crédito/débito</Text>
        {metodo === 'TARJETA' ? <Ionicons name="checkmark-circle" size={22} color="#fff" /> : null}
      </Pressable>
      <Pressable onPress={() => setMetodo('YAPE')} style={[styles.metodo, { backgroundColor: '#742284' }, metodo === 'TARJETA' && styles.metodoApagado]}>
        <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
        <Text style={styles.metodoTexto}>Yape</Text>
        {metodo === 'YAPE' ? <Ionicons name="checkmark-circle" size={22} color="#fff" /> : null}
      </Pressable>

      {metodo === 'TARJETA' ? (
        <View style={styles.formulario}>
          <CampoTexto etiqueta="Número de tarjeta" value={tarjeta} onChangeText={(t) => setTarjeta(formatearTarjeta(t))} keyboardType="number-pad" placeholder="4111 1111 1111 1111" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><CampoTexto etiqueta="Vencimiento" value={vencimiento} onChangeText={(t) => setVencimiento(formatearVence(t))} keyboardType="number-pad" placeholder="MM/AA" /></View>
            <View style={{ flex: 1 }}><CampoTexto etiqueta="CVV" value={cvv} onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry /></View>
          </View>
        </View>
      ) : null}
      {metodo === 'YAPE' ? (
        <View style={styles.formulario}>
          <CampoTexto etiqueta="Celular Yape" value={celular} onChangeText={(t) => setCelular(t.replace(/\D/g, '').slice(0, 9))} keyboardType="number-pad" placeholder="9XXXXXXXX" />
          <CampoTexto etiqueta="Código de aprobación (6 dígitos)" value={codigoYape} onChangeText={(t) => setCodigoYape(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {metodo ? <Boton titulo={`Pagar ${soles(total)}`} onPress={pagar} cargando={cargando} estilo={{ marginTop: 8 }} /> : null}
      {pedido ? <Boton titulo="Pagar más tarde" variante="secundario" onPress={() => navigation.replace('PedidoDetalle', { id: pedido.id })} estilo={{ marginTop: 10 }} /> : null}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondoModal} onPress={() => setAbierto(false)}>
          <View style={styles.hoja}>
            <Text style={styles.hojaTitulo}>Selecciona una tienda</Text>
            <FlatList
              data={tiendas}
              keyExtractor={(t) => String(t.id)}
              ListEmptyComponent={<Text style={styles.ayuda}>No hay tiendas disponibles.</Text>}
              renderItem={({ item }) => (
                <Pressable style={[styles.opcion, tienda?.id === item.id && styles.opcionActiva]} onPress={() => elegir(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opcionNombre}>{item.nombre}</Text>
                    <Text style={styles.ayuda}>{item.direccion}</Text>
                  </View>
                  {tienda?.id === item.id ? <Ionicons name="checkmark-circle" size={22} color={colores.primario} /> : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  vacio: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 24 },
  vacioTexto: { color: colores.textoSuave, fontSize: 16 },
  monto: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14, padding: 18, borderRadius: 16, backgroundColor: colores.primarioClaro, borderWidth: 1, borderColor: colores.borde, marginBottom: 22 },
  montoIcono: { width: 48, height: 48, borderRadius: 24, backgroundColor: colores.primario, alignItems: 'center' as const, justifyContent: 'center' as const },
  montoEtiqueta: { color: colores.textoSuave, fontSize: 13 },
  montoValor: { color: colores.texto, fontSize: 30, fontWeight: '800' as const },
  etiquetaFila: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 8 },
  etiqueta: { fontSize: 15, fontWeight: '700' as const, color: colores.texto },
  requerido: { fontSize: 12, color: colores.textoSuave },
  combo: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, borderWidth: 1, borderColor: colores.borde, borderRadius: radio, backgroundColor: colores.superficie, paddingHorizontal: 14, paddingVertical: 14 },
  comboTexto: { flex: 1, fontSize: 15, color: colores.texto },
  ayuda: { fontSize: 12, color: colores.textoSuave, marginTop: 6 },
  seccion: { marginTop: 24, marginBottom: 8, fontSize: 13, fontWeight: '700' as const, color: colores.textoSuave, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  aviso: { fontSize: 12, color: colores.avisoTexto, backgroundColor: colores.aviso, padding: 8, borderRadius: 8, marginBottom: 12 },
  metodo: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 10, minHeight: 56, borderRadius: 14, marginBottom: 12, paddingHorizontal: 16 },
  metodoApagado: { opacity: 0.55 },
  metodoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  formulario: { marginTop: 6 },
  error: { color: colores.error, marginVertical: 8, fontSize: 14 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center' as const, padding: 20 },
  hoja: { backgroundColor: colores.superficie, borderRadius: 16, padding: 16, maxHeight: '70%' as const },
  hojaTitulo: { fontSize: 16, fontWeight: '800' as const, color: colores.texto, marginBottom: 8 },
  opcion: { flexDirection: 'row' as const, alignItems: 'center' as const, padding: 12, borderRadius: radio, marginBottom: 6, borderWidth: 1, borderColor: colores.borde },
  opcionActiva: { borderColor: colores.primario, borderWidth: 2 },
  opcionNombre: { fontWeight: '700' as const, color: colores.texto },
}));