import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import * as authApi from '../../api/auth';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';

type Props = NativeStackScreenProps<RootParams, 'Restablecer'>;

export default function RestablecerScreen({ navigation, route }: Props) {
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    if (!token.trim()) return setError('Ingresa el código que recibiste por correo.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (password !== confirmar) return setError('Las contraseñas no coinciden. Vuelve a escribirlas.');
    setError(null);
    setCargando(true);
    try {
      await authApi.restablecer(token.trim(), password, confirmar);
      Alert.alert('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.', [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <CampoTexto etiqueta="Código de recuperación" value={token} onChangeText={setToken} autoCapitalize="none" />
      <CampoTexto etiqueta="Nueva contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      <CampoTexto etiqueta="Confirmar contraseña" value={confirmar} onChangeText={setConfirmar} secureTextEntry autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Guardar contraseña" onPress={guardar} cargando={cargando} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({ error: { color: colores.error, marginBottom: 12 } }));
