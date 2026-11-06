import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { listarFaq } from '../../api/catalogo';
import Cargando from '../../components/Cargando';
import MensajeVacio from '../../components/MensajeVacio';
import { colores, radio, crearEstilos } from '../../theme/colores';
import { PreguntaFrecuente } from '../../types';

export default function FaqScreen() {
  const [preguntas, setPreguntas] = useState<PreguntaFrecuente[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => { listarFaq().then(setPreguntas).catch((e) => setError(e.message)); }, []);

  if (error) return <MensajeVacio icono="cloud-offline-outline" titulo="No se pudo cargar la ayuda" detalle={error} />;
  if (!preguntas) return <Cargando />;

  let categoriaActual = '';
  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={{ padding: 12 }}>
      {preguntas.map((p) => {
        const titulo = p.categoria !== categoriaActual ? (categoriaActual = p.categoria) : null;
        return (
          <React.Fragment key={p.id}>
            {titulo ? <Text style={styles.categoria}>{titulo}</Text> : null}
            <Pressable style={styles.tarjeta} onPress={() => setAbierta(abierta === p.id ? null : p.id)}>
              <Text style={styles.pregunta}>{p.pregunta}</Text>
              {abierta === p.id ? <Text style={styles.respuesta}>{p.respuesta}</Text> : null}
            </Pressable>
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}

const styles = crearEstilos(() => ({
  categoria: { fontSize: 13, fontWeight: '700', color: colores.primario, marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: radio, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colores.borde },
  pregunta: { fontWeight: '600', color: colores.texto },
  respuesta: { color: colores.textoSuave, marginTop: 8, lineHeight: 20 },
}));
