/**
 * auth.config.js
 * Configuración de la autenticación. La clave para firmar los tokens se
 * lee de la variable de entorno JWT_SECRET; el valor por defecto sirve
 * solo para desarrollo (en un servidor real hay que definirla siempre).
 */
export const AUTH = Object.freeze({
  jwtSecret: process.env.JWT_SECRET ?? "carpe-eventos-clave-de-desarrollo",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  bcryptRounds: 10,
  passwordMinLength: 8,
});

export default AUTH;
