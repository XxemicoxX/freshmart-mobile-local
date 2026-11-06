import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { useAuth } from '../../context/AuthContext';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { correoValido } from '../../utils/formato';
import { MODO_DEMO } from '../../api/cliente';
import { CUENTAS_DEMO } from '../../demo/servidor';

type Props = NativeStackScreenProps<RootParams, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    if (!correoValido(correo)) return setError('Ingresa un correo válido.');
    if (!password) return setError('Ingresa tu contraseña.');
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion(correo, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <StatusBar style={colores.oscuro ? 'light' : 'dark'} />
      <View style={styles.logo}>
        <Text style={styles.marca}>Freshmart</Text>
        <Text style={styles.lema}>Compra en línea y recoge en tienda</Text>
      </View>
      <CampoTexto etiqueta="Correo electrónico" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <CampoTexto etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Iniciar sesión" onPress={entrar} cargando={cargando} />
      <Pressable onPress={() => navigation.navigate('Recuperar')} style={styles.enlace}>
        <Text style={styles.enlaceTexto}>¿Olvidaste tu contraseña?</Text>
      </Pressable>
      <Boton titulo="Crear una cuenta" variante="secundario" onPress={() => navigation.navigate('Registro')} />
      {MODO_DEMO ? (
        <View style={styles.demo}>
          <Text style={styles.demoTitulo}>Modo demo (sin servidor)</Text>
          <Text style={styles.demoTexto}>Cliente: {CUENTAS_DEMO.cliente.correo} / {CUENTAS_DEMO.cliente.password}</Text>
          <Text style={styles.demoTexto}>Personal: {CUENTAS_DEMO.personal.correo} / {CUENTAS_DEMO.personal.password}</Text>
          <Text style={styles.demoTexto}>También puedes crear tu propio usuario.</Text>
        </View>
      ) : null}
    </Pantalla>
  );
}

const styles = crearEstilos(() => ({
  logo: { alignItems: 'center', marginTop: 60, marginBottom: 36 },
  marca: { fontSize: 36, fontWeight: '800', color: colores.primario },
  lema: { fontSize: 14, color: colores.textoSuave, marginTop: 4 },
  error: { color: colores.error, marginBottom: 12, fontSize: 14 },
  enlace: { alignItems: 'center', paddingVertical: 16 },
  demo: { marginTop: 24, padding: 12, borderRadius: 12, backgroundColor: colores.aviso },
  demoTitulo: { fontWeight: '700', color: colores.avisoTexto, marginBottom: 4 },
  demoTexto: { color: colores.avisoTexto, fontSize: 12, marginTop: 2 },
  enlaceTexto: { color: colores.primario, fontWeight: '600' },
}));
