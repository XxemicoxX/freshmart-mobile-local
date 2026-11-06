import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { listarTiendas } from '../../api/catalogo';
import { useCarrito } from '../../context/CarritoContext';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { Tienda } from '../../types';

type Props = NativeStackScreenProps<RootParams, 'SeleccionTienda'>;

export default function SeleccionTiendaScreen({ navigation }: Props) {
  const { carrito, elegirTienda } = useCarrito();
  const [tiendas, setTiendas] = useState<Tienda[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { listarTiendas().then(setTiendas).catch((e) => setError(e.message)); }, []);

  const elegir = async (t: Tienda) => {
    try {
      await elegirTienda(t.id);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('No se pudo elegir la tienda', e.message);
    }
  };

  if (error) return <MensajeVacio icono="cloud-offline-outline" titulo="No se pudieron cargar las tiendas" detalle={error} />;
  if (!tiendas) return <Cargando />;

  return (
    <FlatList
      data={tiendas}
      keyExtractor={(t) => String(t.id)}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={<Text style={styles.ayuda}>Recogerás tu pedido en la tienda que elijas. No hacemos envíos a domicilio.</Text>}
      renderItem={({ item }) => {
        const activa = carrito?.tienda?.id === item.id;
        return (
          <Pressable onPress={() => elegir(item)} style={[styles.tarjeta, activa && styles.activa]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.dato}>{item.direccion}</Text>
              {item.horarioAtencion ? <Text style={styles.dato}>🕒 {item.horarioAtencion}</Text> : null}
              {item.telefono ? <Text style={styles.dato}>📞 {item.telefono}</Text> : null}
            </View>
            {activa ? <Ionicons name="checkmark-circle" size={26} color={colores.primario} /> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = crearEstilos(() => ({
  ayuda: { color: colores.textoSuave, marginBottom: 12 },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colores.superficie, borderRadius: radio, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde },
  activa: { borderColor: colores.primario, borderWidth: 2 },
  nombre: { fontSize: 16, fontWeight: '700', color: colores.texto },
  dato: { color: colores.textoSuave, marginTop: 3, fontSize: 13 },
}));
