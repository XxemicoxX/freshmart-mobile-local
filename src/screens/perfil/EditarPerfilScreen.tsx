import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { actualizarPerfil, obtenerPerfil } from '../../api/usuario';
import { useAuth } from '../../context/AuthContext';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Cargando from '../../components/Cargando';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';
import { correoValido } from '../../utils/formato';

type Props = NativeStackScreenProps<RootParams, 'EditarPerfil'>;

export default function EditarPerfilScreen({ navigation }: Props) {
  const { usuario, actualizarUsuario } = useAuth();
  const [f, setF] = useState<{ nombres: string; apellidos: string; correo: string; fechaNacimiento: string; telefono: string } | null>(null);
  const [correoOriginal, setCorreoOriginal] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerPerfil().then((p) => {
      setCorreoOriginal(p.correo);
      setF({ nombres: p.nombres, apellidos: p.apellidos, correo: p.correo, fechaNacimiento: p.fechaNacimiento ?? '', telefono: p.telefono ?? '' });
    }).catch((e) => setError(e.message));
  }, []);

  if (!f) return error ? <Text style={styles.error}>{error}</Text> : <Cargando />;
  const cambiar = (campo: keyof typeof f) => (v: string) => setF({ ...f, [campo]: v });
  const cambiaCorreo = f.correo.trim().toLowerCase() !== correoOriginal.toLowerCase();

  const guardar = async () => {
    if (!f.nombres.trim() || !f.apellidos.trim()) return setError('Completa tus nombres y apellidos.');
    if (!correoValido(f.correo)) return setError('Ingresa un correo válido.');
    if (cambiaCorreo && !passwordActual) return setError('Para cambiar tu correo, ingresa tu contraseña actual.');
    setError(null);
    setCargando(true);
    try {
      const p = await actualizarPerfil({
        nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), correo: f.correo.trim(),
        fechaNacimiento: f.fechaNacimiento || null, telefono: f.telefono || null,
        passwordActual: cambiaCorreo ? passwordActual : undefined,
      });
      if (usuario) actualizarUsuario({ ...usuario, nombres: p.nombres, apellidos: p.apellidos, correo: p.correo });
      Alert.alert('Listo', 'Tus datos se actualizaron.', [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
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
      <CampoTexto etiqueta="Fecha de nacimiento" placeholder="AAAA-MM-DD" value={f.fechaNacimiento} onChangeText={cambiar('fechaNacimiento')} />
      <CampoTexto etiqueta="Teléfono" value={f.telefono} onChangeText={cambiar('telefono')} keyboardType="phone-pad" />
      {cambiaCorreo ? <CampoTexto etiqueta="Contraseña actual (para cambiar el correo)" value={passwordActual} onChangeText={setPasswordActual} secureTextEntry autoCapitalize="none" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Guardar cambios" onPress={guardar} cargando={cargando} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({ error: { color: colores.error, marginBottom: 12, padding: 4 } }));
