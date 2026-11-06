import { http } from './cliente';
import { Configuracion, Perfil, PerfilRequest } from '../types';

export const obtenerPerfil = () => http.get<Perfil>('/usuario/perfil');
export const actualizarPerfil = (datos: PerfilRequest) => http.put<Perfil>('/usuario/perfil', datos);
export const cambiarPassword = (passwordActual: string, passwordNueva: string, confirmar: string) =>
  http.patch<{ mensaje: string; token: string }>('/usuario/password', { passwordActual, passwordNueva, confirmar });
export const obtenerConfiguracion = () => http.get<Configuracion>('/usuario/configuracion');
export const guardarConfiguracion = (c: Configuracion) => http.put<Configuracion>('/usuario/configuracion', c);
export const eliminarCuenta = (password: string) => http.delete<void>('/usuario', { password });
