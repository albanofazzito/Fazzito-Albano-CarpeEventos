/**
 * asyncHandler.js
 * Envuelve un controller async para que cualquier error (o rechazo de
 * promesa) se propague automáticamente a next(err), y así siempre termine
 * en el middleware de manejo centralizado de errores, sin try/catch
 * repetido en cada controller.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
