import { useMemo, useRef, useState } from "react";
import { useToast } from "./useToast.js";

/**
 * Lógica común de los formularios de la app (evento, login, registro,
 * cliente, servicio):
 *  - guarda los valores y valida con `validate(values)` en cada cambio;
 *  - muestra el error de un campo recién cuando se sale de él o se intenta
 *    enviar, no mientras se empieza a escribir;
 *  - al enviar con errores, enfoca el primer campo con problemas y avisa
 *    con una notificación; si está todo bien, llama a `onSubmit(values)`.
 *
 * `validate` tiene que ser estable (una función importada o con useCallback).
 */
export function useFormulario({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [tocados, setTocados] = useState({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);
  const toast = useToast();

  const errores = useMemo(() => validate(values), [values, validate]);

  const errorVisible = (campo) => (tocados[campo] || intentoEnviar ? errores[campo] : undefined);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((actuales) => ({ ...actuales, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTocados((actuales) => (actuales[name] ? actuales : { ...actuales, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIntentoEnviar(true);

    const cantidad = Object.keys(errores).length;
    if (cantidad > 0) {
      // Se enfoca el primer campo con error en el orden en que aparece en pantalla.
      const primero = Array.from(formRef.current?.elements ?? []).find((elemento) => errores[elemento.name]);
      primero?.focus();
      toast.error(
        "Revisá los datos del formulario",
        cantidad === 1 ? "Hay un campo con error." : `Hay ${cantidad} campos con errores.`
      );
      return;
    }

    setEnviando(true);
    try {
      await onSubmit(values);
    } finally {
      setEnviando(false);
    }
  }

  return { values, errores, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef };
}

export default useFormulario;
