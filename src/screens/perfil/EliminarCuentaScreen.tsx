import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { eliminarCuenta } from '../../api/usuario';
import { useAuth } from '../../context/AuthContext';
import Boton from '../../components/Boton';
import CampoTexto from '../../components/CampoTexto';
import Pantalla from '../../components/Pantalla';
import { colores, crearEstilos } from '../../theme/colores';

export default function EliminarCuentaScreen() {
  const { cerrarSesion } = useAuth();
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = () => {
    if (!password) return setError('Ingresa tu contraseña para confirmar.');
    Alert.alert('Eliminar cuenta', 'Esta acción no se puede deshacer. ¿Deseas continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          setCargando(true);
          setError(null);
          try { await eliminarCuenta(password); await cerrarSesion(); }
          catch (e: any) { setError(e.message); }
          finally { setCargando(false); }
        },
      },
    ]);
  };

  return (
    <Pantalla>
      <Text style={styles.aviso}>Se eliminará tu cuenta de Freshmart. Si tienes pedidos en curso deberás recogerlos antes de poder eliminarla.</Text>
      <CampoTexto etiqueta="Tu contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Eliminar mi cuenta" variante="peligro" onPress={confirmar} cargando={cargando} />
    </Pantalla>
  );
}
const styles = crearEstilos(() => ({
  aviso: { color: colores.textoSuave, marginBottom: 16, lineHeight: 20 },
  error: { color: colores.error, marginBottom: 12 },
}));
