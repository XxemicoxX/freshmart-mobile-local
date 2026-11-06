import { http } from './cliente';
import { LoginResponse, RegistroRequest } from '../types';

export const login = (correo: string, password: string) => http.post<LoginResponse>('/auth/login', { correo, password });
export const registrar = (datos: RegistroRequest) => http.post<void>('/auth/registro', datos);
export const recuperar = (correo: string) => http.post<void>('/auth/recuperar', { correo });
export const restablecer = (token: string, password: string, confirmarPassword: string) =>
  http.post<void>('/auth/restablecer', { token, password, confirmarPassword });
