import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aplicarTema, NombreTema } from '../theme/colores';

const CLAVE = 'freshmart_tema';

interface TemaContextoTipo { tema: NombreTema; cambiarTema: (t: NombreTema) => void; }
const TemaContext = createContext<TemaContextoTipo>(null as unknown as TemaContextoTipo);
export const useTema = () => useContext(TemaContext);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<NombreTema>('CLARO');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((t) => { if (t === 'OSCURO') { aplicarTema('OSCURO'); setTema('OSCURO'); } })
      .catch(() => {})
      .finally(() => setListo(true));
  }, []);

  const cambiarTema = (t: NombreTema) => {
    if (t === tema) return;
    aplicarTema(t);
    setTema(t);
    AsyncStorage.setItem(CLAVE, t).catch(() => {});
  };

  if (!listo) return null;
  return <TemaContext.Provider value={{ tema, cambiarTema }}>{children}</TemaContext.Provider>;
}
