import { StyleSheet } from 'react-native';

export interface Paleta {
  primario: string; primarioOscuro: string; primarioClaro: string; acento: string;
  fondo: string; superficie: string; texto: string; textoSuave: string; borde: string;
  error: string; errorClaro: string; exito: string; aviso: string; avisoTexto: string; oscuro: boolean;
}
export type NombreTema = 'CLARO' | 'OSCURO';

const claro: Paleta = {
  primario: '#2E7D32', primarioOscuro: '#1B5E20', primarioClaro: '#E8F5E9', acento: '#F9A825',
  fondo: '#F6F7F4', superficie: '#FFFFFF', texto: '#1F2933', textoSuave: '#6B7280', borde: '#E2E5E0',
  error: '#C62828', errorClaro: '#FDECEA', exito: '#2E7D32', aviso: '#FFF8E1', avisoTexto: '#8A6D00', oscuro: false,
};
const oscuro: Paleta = {
  primario: '#388E3C', primarioOscuro: '#A5D6A7', primarioClaro: '#1F3322', acento: '#FFCA28',
  fondo: '#101410', superficie: '#1B211B', texto: '#E8ECE8', textoSuave: '#9AA59A', borde: '#2E382E',
  error: '#EF5350', errorClaro: '#3B1F1F', exito: '#66BB6A', aviso: '#3A3220', avisoTexto: '#F2D675', oscuro: true,
};

/** Paleta activa. Se modifica en el lugar con aplicarTema(); la app se vuelve a dibujar al cambiar el tema. */
export const colores: Paleta = { ...claro };
export const radio = 12;

let version = 0;
export let temaActual: NombreTema = 'CLARO';

export function aplicarTema(t: NombreTema) {
  Object.assign(colores, t === 'OSCURO' ? oscuro : claro);
  temaActual = t;
  version++;
}

/** Igual que StyleSheet.create, pero los estilos se recalculan cuando cambia el tema. */
export function crearEstilos<T extends StyleSheet.NamedStyles<T>>(fn: () => T): T {
  let cache: T | null = null;
  let versionCache = -1;
  return new Proxy({} as T, {
    get(_, clave) {
      if (cache === null || versionCache !== version) {
        cache = StyleSheet.create(fn());
        versionCache = version;
      }
      return (cache as any)[clave];
    },
  });
}
