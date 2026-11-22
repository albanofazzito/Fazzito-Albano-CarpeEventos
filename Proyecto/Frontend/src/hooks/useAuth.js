import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";

/**
 * Acceso a la sesión:
 *   const { usuario, esAdmin, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth tiene que usarse dentro de <AuthProvider>.");
  }
  return context;
}

export default useAuth;
