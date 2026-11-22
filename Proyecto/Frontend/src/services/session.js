/**
 * session.js
 * Guarda el token de la sesión en localStorage para que siga abierta al
 * recargar la página. Los datos del usuario no se guardan: se vuelven a
 * pedir a la API (/auth/perfil) con este token.
 *
 * localStorage puede fallar (modo privado, almacenamiento bloqueado): en
 * ese caso la sesión simplemente dura hasta que se cierra la pestaña.
 */
const STORAGE_KEY = "carpe-eventos.token";
let tokenEnMemoria = null;

export function getToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? tokenEnMemoria;
  } catch {
    return tokenEnMemoria;
  }
}

export function saveToken(token) {
  tokenEnMemoria = token;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Sin almacenamiento disponible: queda solo en memoria.
  }
}

export function clearToken() {
  tokenEnMemoria = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar.
  }
}
