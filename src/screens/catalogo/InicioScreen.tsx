import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../../navigation/tipos';
import { listarCategorias, listarProductos } from '../../api/catalogo';
import { useCarrito } from '../../context/CarritoContext';
import TarjetaProducto from '../../components/TarjetaProducto';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { Categoria, Producto } from '../../types';

export default function InicioScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { agregar } = useCarrito();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {});
  }, [nav]);

  const cargar = useCallback(async (p: number) => {
    try {
      setError(null);
      const r = await listarProductos({ categoriaId, q: busqueda, pagina: p });
      setProductos((prev) => (p === 0 ? r.contenido : [...prev, ...r.contenido]));
      setPagina(r.pagina);
      setTotalPaginas(r.totalPaginas);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  }, [categoriaId, busqueda]);

  useEffect(() => { setCargando(true); cargar(0); }, [cargar]);

  const masProductos = () => {
    if (cargandoMas || pagina + 1 >= totalPaginas) return;
    setCargandoMas(true);
    cargar(pagina + 1);
  };

  const agregarAlCarrito = async (p: Producto) => {
    try {
      await agregar(p.id, 1);
    } catch (e: any) {
      Alert.alert('No se pudo agregar', e.message);
    }
  };

  return (
    <View style={styles.fondo}>
      <View style={styles.cabecera}>
        <View style={styles.buscador}>
          <Ionicons name="search" size={18} color={colores.textoSuave} />
          <TextInput
            style={styles.input}
            placeholder="Buscar productos"
            placeholderTextColor={colores.textoSuave}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={() => setBusqueda(texto.trim())}
            returnKeyType="search"
          />
          {texto ? <Pressable onPress={() => { setTexto(''); setBusqueda(''); }}><Ionicons name="close-circle" size={18} color={colores.textoSuave} /></Pressable> : null}
        </View>
        <Pressable style={styles.campana} onPress={() => nav.navigate('Notificaciones')} accessibilityLabel="Notificaciones">
          <Ionicons name="notifications-outline" size={24} color={colores.primarioOscuro} />
        </Pressable>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip texto="Todos" activo={categoriaId === null} onPress={() => setCategoriaId(null)} />
          {categorias.map((c) => (
            <Chip key={c.id} texto={c.nombre} activo={categoriaId === c.id} onPress={() => setCategoriaId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {cargando ? <Cargando /> : error ? (
        <MensajeVacio icono="cloud-offline-outline" titulo="No se pudo cargar el catálogo" detalle={error} accion="Reintentar" onAccion={() => { setCargando(true); cargar(0); }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 8, flexGrow: 1 }}
          renderItem={({ item }) => (
            <TarjetaProducto producto={item} onPress={() => nav.navigate('Producto', { id: item.id })} onAgregar={() => agregarAlCarrito(item)} />
          )}
          onEndReached={masProductos}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<MensajeVacio icono="search-outline" titulo="Sin resultados" detalle="Prueba con otra búsqueda o categoría." />}
          ListFooterComponent={cargandoMas ? <Cargando /> : null}
        />
      )}
    </View>
  );
}

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, activo && styles.chipActivo]}>
      <Text style={[styles.chipTexto, activo && { color: '#fff' }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = crearEstilos(() => ({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  cabecera: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  buscador: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colores.superficie, borderRadius: radio, paddingHorizontal: 12, borderWidth: 1, borderColor: colores.borde },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15, color: colores.texto },
  campana: { padding: 8 },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { color: colores.texto, fontWeight: '600', fontSize: 13 },
}));