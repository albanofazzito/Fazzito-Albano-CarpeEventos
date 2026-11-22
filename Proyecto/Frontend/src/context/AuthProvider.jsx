import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { useToast } from "../hooks/useToast.js";
import { onSessionExpired } from "../services/apiClient.js";
import { getPerfil, login as loginRequest, registrar as registrarRequest } from "../services/auth.service.js";
import { clearToken, getToken, saveToken } from "../services/session.js";
import { ROLES } from "../utils/roles.js";

/**
 * Maneja la sesión de toda la app. Al cargar la página, si hay un token
 * guardado se piden los datos del usuario a la API para restaurar la
 * sesión. Si la API responde que el token venció (401), se cierra la
 * sesión y se avisa con una notificación.
 */
export default function AuthProvider({ children }) {
  const toast = useToast();
  const [sesion, setSesion] = useState(() => ({ usuario: null, cargando: Boolean(getToken()) }));

  useEffect(() => {
    onSessionExpired((mensaje) => {
      clearToken();
      setSesion({ usuario: null, cargando: false });
      toast.info("Tu sesión terminó", mensaje);
    });
    return () => onSessionExpired(null);
  }, [toast]);

  useEffect(() => {
    if (!getToken()) return undefined;
    let ignore = false;

    getPerfil().then(
      (usuario) => {
        if (!ignore) setSesion({ usuario, cargando: false });
      },
      () => {
        // Si el token no sirve, apiClient ya lo borró (onSessionExpired). Si la
        // API no respondió, el token se conserva para el próximo intento.
        if (!ignore) setSesion({ usuario: null, cargando: false });
      }
    );

    return () => {
      ignore = true;
    };
  }, []);

  const iniciarSesion = useCallback(({ token, usuario }) => {
    saveToken(token);
    setSesion({ usuario, cargando: false });
    return usuario;
  }, []);

  const login = useCallback(async (credenciales) => iniciarSesion(await loginRequest(credenciales)), [iniciarSesion]);

  const registrar = useCallback(async (datos) => iniciarSesion(await registrarRequest(datos)), [iniciarSesion]);

  const logout = useCallback(() => {
    clearToken();
    setSesion({ usuario: null, cargando: false });
  }, []);

  /** Después de editar los datos de contacto, para que el menú muestre el nombre nuevo. */
  const actualizarUsuario = useCallback((cambios) => {
    setSesion((actual) => ({ ...actual, usuario: actual.usuario && { ...actual.usuario, ...cambios } }));
  }, []);

  const value = useMemo(
    () => ({
      usuario: sesion.usuario,
      cargando: sesion.cargando,
      esAdmin: sesion.usuario?.rol === ROLES.ADMINISTRADOR,
      esCliente: sesion.usuario?.rol === ROLES.CLIENTE,
      login,
      registrar,
      logout,
      actualizarUsuario,
    }),
    [sesion, login, registrar, logout, actualizarUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
