import { createContext } from "react";

/**
 * Sesión del usuario: { usuario, cargando, esAdmin, esCliente, login,
 * registrar, logout, actualizarUsuario }. Se consume con el hook useAuth.
 */
export const AuthContext = createContext(null);

export default AuthContext;
