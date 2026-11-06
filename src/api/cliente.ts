import * as SecureStore from 'expo-secure-store';
import { ErrorApi } from './errores';
import { peticionDemo } from '../demo/servidor';

// Modo demo: la app funciona sin servidor (datos locales). Se desactiva con EXPO_PUBLIC_MODO_DEMO=false
export const MODO_DEMO = process.env.EXPO_PUBLIC_MODO_DEMO !== 'false';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';
const CLAVE_TOKEN = 'freshmart_token';

let token: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export async function cargarToken() {
  token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  return token;
}
export async function guardarToken(nuevo: string | null) {
  token = nuevo;
  if (nuevo) await SecureStore.setItemAsync(CLAVE_TOKEN, nuevo);
  else await SecureStore.deleteItemAsync(CLAVE_TOKEN);
}
export const obtenerToken = () => token;
export function registrarAlExpirarSesion(fn: () => void) { alExpirarSesion = fn; }

export { ErrorApi };

async function peticion<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  if (MODO_DEMO) {
    try {
      return (await peticionDemo(metodo, ruta, cuerpo, token)) as T;
    } catch (e) {
      if (e instanceof ErrorApi && e.estado === 401 && token) alExpirarSesion?.();
      throw e;
    }
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, { method: metodo, headers, body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined });
  } catch (e) {
    throw new ErrorApi(0, `No se pudo conectar con el servidor. Revisa tu conexión a internet.\n(${metodo} ${API_URL}${ruta} - ${String(e)})`);
  }
  if (!res.ok) {
    let mensaje = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    try { const data = await res.json(); if (data?.mensaje) mensaje = data.mensaje; } catch { /* sin cuerpo */ }
    if (res.status === 401 && token) { alExpirarSesion?.(); }
    throw new ErrorApi(res.status, mensaje);
  }
  const texto = await res.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

export const http = {
  get: <T>(ruta: string) => peticion<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('PUT', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('PATCH', ruta, cuerpo),
  delete: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('DELETE', ruta, cuerpo),
};
