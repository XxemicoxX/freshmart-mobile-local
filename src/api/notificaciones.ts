import { http } from './cliente';
import { PaginaNotificaciones } from '../types';

export const listarNotificaciones = (soloNoLeidas = false, pagina = 0, tamanio = 30) =>
  http.get<PaginaNotificaciones>(`/notificaciones?soloNoLeidas=${soloNoLeidas}&pagina=${pagina}&tamanio=${tamanio}`);
export const marcarLeida = (id: number) => http.patch<void>(`/notificaciones/${id}/leida`);
export const marcarTodasLeidas = () => http.put<number>('/notificaciones/leidas');
