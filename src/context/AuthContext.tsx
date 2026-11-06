import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cargarToken, guardarToken, registrarAlExpirarSesion } from '../api/cliente';
import * as authApi from '../api/auth';
import { obtenerConfiguracion, obtenerPerfil } from '../api/usuario';
import { useTema } from './TemaContext';
import { Rol, Usuario } from '../types';

interface AuthContextoTipo {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  reemplazarToken: (token: string) => Promise<void>;
  actualizarUsuario: (u: Usuario) => void;
}

const AuthContext = createContext<AuthContextoTipo>(null as unknown as AuthContextoTipo);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const { cambiarTema } = useTema();

  // El tema elegido se guarda en la cuenta: al iniciar sesión se aplica en este dispositivo
  const aplicarTemaDeCuenta = useCallback(() => {
    obtenerConfiguracion().then((c) => cambiarTema(c.tema)).catch(() => {});
  }, [cambiarTema]);

  const cerrarSesion = useCallback(async () => {
    await guardarToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    registrarAlExpirarSesion(() => { cerrarSesion(); });
    (async () => {
      try {
        const token = await cargarToken();
        if (token) {
          const p = await obtenerPerfil();
          setUsuario({ id: p.id, nombres: p.nombres, apellidos: p.apellidos, correo: p.correo, rol: p.rol as Rol });
          aplicarTemaDeCuenta();
        }
      } catch {
        await guardarToken(null);
      } finally {
        setCargando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerrarSesion]);

  const iniciarSesion = async (correo: string, password: string) => {
    const r = await authApi.login(correo.trim(), password);
    await guardarToken(r.token);
    setUsuario(r.usuario);
    aplicarTemaDeCuenta();
  };

  const reemplazarToken = (token: string) => guardarToken(token);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, reemplazarToken, actualizarUsuario: setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}
