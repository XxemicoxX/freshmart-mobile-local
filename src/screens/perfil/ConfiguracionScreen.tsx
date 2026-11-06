import React, { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { guardarConfiguracion, obtenerConfiguracion } from '../../api/usuario';
import { useTema } from '../../context/TemaContext';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import Pantalla, { Seccion } from '../../components/Pantalla';
import { colores, crearEstilos, radio } from '../../theme/colores';
import { Configuracion } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'Configuracion'>;

const SOPORTE = { correo: 'soporte@freshmart.pe', telefono: '01-5550100', horario: 'Lun-Dom 8:00 a 22:00' };

export default function ConfiguracionScreen({ navigation }: Props) {
  const { cambiarTema } = useTema();
  const [cfg, setCfg] = useState<Configuracion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { obtenerConfiguracion().then(setCfg).catch((e) => setError(e.message)); }, []);

  const cambiar = async (cambio: Partial<Configuracion>) => {
    if (!cfg) return;
    const anterior = cfg;
    setError(null);
    setCfg({ ...cfg, ...cambio });
    try {
      const guardada = await guardarConfiguracion({ ...cfg, ...cambio });
      setCfg(guardada);
      if (cambio.tema) cambiarTema(guardada.tema); // vuelve a dibujar toda la app con el tema elegido
    } catch (e: any) {
      setCfg(anterior);
      setError(e.message);
    }
  };

  const abrir = (url: string) => Linking.openURL(url).catch(() => setError('No se pudo abrir la aplicación correspondiente en este dispositivo.'));

  if (error && !cfg) return <MensajeVacio icono="cloud-offline-outline" titulo="No se pudo cargar la configuración" detalle={error} />;
  if (!cfg) return <Cargando />;

  const Interruptor = ({ texto, detalle, valor, campo }: { texto: string; detalle: string; valor: boolean; campo: 'notifPedidos' | 'notifPromociones' | 'notifCorreo' }) => (
    <View style={styles.fila}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.texto}>{texto}</Text>
        <Text style={styles.detalle}>{detalle}</Text>
      </View>
      <Switch value={valor} onValueChange={(v) => cambiar({ [campo]: v })} trackColor={{ true: colores.primario, false: colores.borde }} thumbColor="#fff" />
    </View>
  );

  const Opcion = ({ valor, titulo, icono }: { valor: 'CLARO' | 'OSCURO'; titulo: string; icono: keyof typeof Ionicons.glyphMap }) => {
    const activa = cfg.tema === valor;
    return (
      <Pressable onPress={() => cambiar({ tema: valor })} style={[styles.tema, activa && styles.temaActivo]} accessibilityRole="radio" accessibilityState={{ selected: activa }}>
        <Ionicons name={icono} size={26} color={activa ? '#fff' : colores.primario} />
        <Text style={[styles.temaTexto, activa && { color: '#fff' }]}>{titulo}</Text>
      </Pressable>
    );
  };

  const Contacto = ({ icono, texto, onPress }: { icono: keyof typeof Ionicons.glyphMap; texto: string; onPress?: () => void }) => (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.contacto}>
      <Ionicons name={icono} size={20} color={colores.primario} />
      <Text style={styles.texto}>{texto}</Text>
    </Pressable>
  );

  return (
    <Pantalla>
      <Text style={styles.titulo}>Notificaciones</Text>
      <Seccion>
        <Interruptor texto="Avisos de mis pedidos" detalle="Cambios de estado, pago y recojo" valor={cfg.notifPedidos} campo="notifPedidos" />
        <Interruptor texto="Promociones y ofertas" detalle="Descuentos y productos destacados" valor={cfg.notifPromociones} campo="notifPromociones" />
        <Interruptor texto="Avisos por correo" detalle="Recibe también las notificaciones en tu correo" valor={cfg.notifCorreo} campo="notifCorreo" />
      </Seccion>

      <Text style={styles.titulo}>Apariencia</Text>
      <Seccion>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Opcion valor="CLARO" titulo="Claro" icono="sunny-outline" />
          <Opcion valor="OSCURO" titulo="Oscuro" icono="moon-outline" />
        </View>
        <Text style={[styles.detalle, { marginTop: 10 }]}>El tema se guarda en tu cuenta y se aplica a toda la aplicación.</Text>
      </Seccion>

      <Text style={styles.titulo}>Soporte</Text>
      <Seccion>
        <Contacto icono="help-circle-outline" texto="Preguntas frecuentes" onPress={() => navigation.navigate('Faq')} />
        <Contacto icono="mail-outline" texto={SOPORTE.correo} onPress={() => abrir(`mailto:${SOPORTE.correo}?subject=Soporte%20Freshmart`)} />
        <Contacto icono="call-outline" texto={SOPORTE.telefono} onPress={() => abrir(`tel:${SOPORTE.telefono.replace(/-/g, '')}`)} />
        <Contacto icono="time-outline" texto={`Atención: ${SOPORTE.horario}`} />
        <Contacto icono="bug-outline" texto="Reportar un problema" onPress={() => abrir(`mailto:${SOPORTE.correo}?subject=Problema%20en%20la%20app%20Freshmart`)} />
        <Text style={[styles.detalle, { marginTop: 6 }]}>Freshmart móvil 1.0.0</Text>
      </Seccion>

      {error ? <Text style={{ color: colores.error }}>{error}</Text> : null}
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  titulo: { fontSize: 13, fontWeight: '700' as const, color: colores.primario, textTransform: 'uppercase' as const, marginBottom: 8, marginTop: 4 },
  fila: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, paddingVertical: 8 },
  texto: { fontSize: 15, color: colores.texto },
  detalle: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  tema: { flex: 1, alignItems: 'center' as const, gap: 6, paddingVertical: 14, borderRadius: radio, borderWidth: 1.5, borderColor: colores.primario, backgroundColor: colores.superficie },
  temaActivo: { backgroundColor: colores.primario },
  temaTexto: { fontWeight: '700' as const, color: colores.primario },
  contacto: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 10 },
}));
