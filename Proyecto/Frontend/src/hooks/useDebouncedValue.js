import { useEffect, useState } from "react";

/**
 * Devuelve `value` recién cuando dejó de cambiar durante `delay` ms. Sirve
 * para no pedirle a la API una estimación por cada tecla que se escribe.
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
