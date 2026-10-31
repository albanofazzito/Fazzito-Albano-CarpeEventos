import { useCallback, useEffect, useState } from "react";

/**
 * Ejecuta una función asíncrona (en general, un servicio de la API) y expone
 * su estado para que la pantalla pueda mostrar carga, error o contenido.
 *
 * - `asyncFn` tiene que ser estable: una función importada o envuelta en
 *   useCallback. Cada vez que cambia se vuelve a ejecutar.
 * - `reload()` repite la petición (botón "Reintentar").
 * - `setData()` actualiza el resultado local después de crear, editar o
 *   borrar, sin volver a pedir todo al servidor.
 */
export function useAsync(asyncFn) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ data: null, error: null, source: null, attempt: -1 });

  useEffect(() => {
    let ignore = false;

    asyncFn().then(
      (data) => {
        if (!ignore) setResult({ data, error: null, source: asyncFn, attempt });
      },
      (error) => {
        if (!ignore) setResult({ data: null, error, source: asyncFn, attempt });
      }
    );

    // Si el componente se desmonta o la función cambia antes de que llegue la
    // respuesta, se descarta el resultado viejo.
    return () => {
      ignore = true;
    };
  }, [asyncFn, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const setData = useCallback((updater) => {
    setResult((prev) => ({
      ...prev,
      data: typeof updater === "function" ? updater(prev.data) : updater,
    }));
  }, []);

  // Está cargando mientras el último resultado no corresponda a la petición actual.
  const loading = result.source !== asyncFn || result.attempt !== attempt;

  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
    reload,
    setData,
  };
}

export default useAsync;
