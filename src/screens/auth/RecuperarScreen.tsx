import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import * as authApi from '../../api/auth';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { correoValido } from '../../utils/formato';
import { MODO_DEMO } from '../../api/cliente';
import { CODIGO_RECUPERACION_DEMO } from '../../demo/servidor';

type Props = NativeStackScreenProps<RootParams, 'Recuperar'>;

export default function RecuperarScreen({ navigation }: Props) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const enviar = async () => {
    if (!correoValido(correo)) return setError('Ingresa un correo válido.');
    setError(null);
    setCargando(true);
    try {
      await authApi.recuperar(correo.trim());
      setEnviado(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Text style={styles.texto}>Ingresa el correo de tu cuenta y te enviaremos un código para crear una nueva contraseña.</Text>
      <CampoTexto etiqueta="Correo electrónico" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {enviado ? <Text style={styles.ok}>Si el correo está registrado, recibirás las instrucciones en unos minutos.{MODO_DEMO ? ` (Modo demo: usa el código ${CODIGO_RECUPERACION_DEMO})` : ''}</Text> : null}
      <Boton titulo="Enviar instrucciones" onPress={enviar} cargando={cargando} />
      <Boton titulo="Ya tengo un código" variante="secundario" onPress={() => navigation.navigate('Restablecer')} estilo={{ marginTop: 12 }} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({
  texto: { color: colores.textoSuave, marginBottom: 16, fontSize: 15 },
  error: { color: colores.error, marginBottom: 12 },
  ok: { color: colores.exito, marginBottom: 12 },
}));
