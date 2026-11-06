import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { cambiarPassword } from '../../api/usuario';
import { useAuth } from '../../context/AuthContext';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';

type Props = NativeStackScreenProps<RootParams, 'CambiarPassword'>;

export default function CambiarPasswordScreen({ navigation }: Props) {
  const { reemplazarToken } = useAuth();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    if (!actual) return setError('Ingresa tu contraseña actual.');
    if (nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (nueva !== confirmar) return setError('Las contraseñas nuevas no coinciden. Vuelve a escribirlas.');
    setError(null);
    setCargando(true);
    try {
      const r = await cambiarPassword(actual, nueva, confirmar);
      await reemplazarToken(r.token); // el backend cierra las otras sesiones y entrega un token nuevo
      Alert.alert('Contraseña actualizada', r.mensaje, [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <CampoTexto etiqueta="Contraseña actual" value={actual} onChangeText={setActual} secureTextEntry autoCapitalize="none" />
      <CampoTexto etiqueta="Nueva contraseña" value={nueva} onChangeText={setNueva} secureTextEntry autoCapitalize="none" />
      <CampoTexto etiqueta="Confirmar nueva contraseña" value={confirmar} onChangeText={setConfirmar} secureTextEntry autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Cambiar contraseña" onPress={guardar} cargando={cargando} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({ error: { color: colores.error, marginBottom: 12 } }));
