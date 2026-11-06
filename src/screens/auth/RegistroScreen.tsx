import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import * as authApi from '../../api/auth';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { correoValido } from '../../utils/formato';

type Props = NativeStackScreenProps<RootParams, 'Registro'>;

export default function RegistroScreen({ navigation }: Props) {
  const [f, setF] = useState({ nombres: '', apellidos: '', correo: '', fechaNacimiento: '', password: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cambiar = (campo: keyof typeof f) => (v: string) => setF({ ...f, [campo]: v });

  const registrar = async () => {
    if (!f.nombres.trim() || !f.apellidos.trim()) return setError('Completa tus nombres y apellidos.');
    if (!correoValido(f.correo)) return setError('Ingresa un correo válido.');
    if (f.fechaNacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(f.fechaNacimiento)) return setError('La fecha debe tener el formato AAAA-MM-DD.');
    if (f.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (f.password !== f.confirmar) return setError('Las contraseñas no coinciden. Vuelve a escribirlas.');
    setError(null);
    setCargando(true);
    try {
      await authApi.registrar({
        nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), correo: f.correo.trim(),
        fechaNacimiento: f.fechaNacimiento || null, password: f.password, confirmarPassword: f.confirmar,
      });
      Alert.alert('¡Cuenta creada!', 'Ya puedes iniciar sesión.', [{ text: 'Ir a iniciar sesión', onPress: () => navigation.navigate('Login') }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <CampoTexto etiqueta="Nombres" value={f.nombres} onChangeText={cambiar('nombres')} autoCapitalize="words" />
      <CampoTexto etiqueta="Apellidos" value={f.apellidos} onChangeText={cambiar('apellidos')} autoCapitalize="words" />
      <CampoTexto etiqueta="Correo electrónico" value={f.correo} onChangeText={cambiar('correo')} keyboardType="email-address" autoCapitalize="none" />
      <CampoTexto etiqueta="Fecha de nacimiento (opcional)" placeholder="AAAA-MM-DD" value={f.fechaNacimiento} onChangeText={cambiar('fechaNacimiento')} keyboardType="numbers-and-punctuation" />
      <CampoTexto etiqueta="Contraseña" value={f.password} onChangeText={cambiar('password')} secureTextEntry autoCapitalize="none" />
      <CampoTexto etiqueta="Confirmar contraseña" value={f.confirmar} onChangeText={cambiar('confirmar')} secureTextEntry autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Registrarme" onPress={registrar} cargando={cargando} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({ error: { color: colores.error, marginBottom: 12 } }));
