import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { useAuth } from '../../context/AuthContext';
import { colores, radio, crearEstilos } from '../../theme/colores';

export default function PerfilScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { usuario, cerrarSesion } = useAuth();

  const salir = () =>
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);

  const opciones: { icono: keyof typeof Ionicons.glyphMap; texto: string; ir: () => void }[] = [
    { icono: 'person-outline', texto: 'Editar perfil', ir: () => nav.navigate('EditarPerfil') },
    { icono: 'lock-closed-outline', texto: 'Cambiar contraseña', ir: () => nav.navigate('CambiarPassword') },
    { icono: 'notifications-outline', texto: 'Notificaciones', ir: () => nav.navigate('Notificaciones') },
    { icono: 'settings-outline', texto: 'Configuración', ir: () => nav.navigate('Configuracion') },
    { icono: 'help-circle-outline', texto: 'Preguntas frecuentes', ir: () => nav.navigate('Faq') },
    { icono: 'trash-outline', texto: 'Eliminar cuenta', ir: () => nav.navigate('EliminarCuenta') },
  ];

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.cabecera}>
        <View style={styles.avatar}><Text style={styles.inicial}>{usuario?.nombres.charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.nombre}>{usuario?.nombres} {usuario?.apellidos}</Text>
        <Text style={styles.correo}>{usuario?.correo}</Text>
      </View>
      {opciones.map((o) => (
        <Pressable key={o.texto} style={styles.opcion} onPress={o.ir}>
          <Ionicons name={o.icono} size={22} color={colores.primario} />
          <Text style={styles.opcionTexto}>{o.texto}</Text>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSuave} />
        </Pressable>
      ))}
      <Pressable style={[styles.opcion, { marginTop: 12 }]} onPress={salir}>
        <Ionicons name="log-out-outline" size={22} color={colores.error} />
        <Text style={[styles.opcionTexto, { color: colores.error }]}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = crearEstilos(() => ({
  cabecera: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colores.primario, alignItems: 'center', justifyContent: 'center' },
  inicial: { color: '#fff', fontSize: 32, fontWeight: '800' },
  nombre: { fontSize: 20, fontWeight: '800', color: colores.texto, marginTop: 10 },
  correo: { color: colores.textoSuave },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colores.superficie, padding: 14, borderRadius: radio, marginBottom: 8, borderWidth: 1, borderColor: colores.borde },
  opcionTexto: { flex: 1, fontSize: 16, color: colores.texto },
}));
