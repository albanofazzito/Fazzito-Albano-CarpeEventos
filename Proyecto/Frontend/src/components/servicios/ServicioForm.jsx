import { useId } from "react";
import { useFormulario } from "../../hooks/useFormulario.js";
import { SERVICIO_FORM_VACIO } from "../../utils/formularios.js";
import { validateServicioForm } from "../../utils/validators.js";
import Button from "../ui/Button.jsx";
import TextAreaField from "../ui/TextAreaField.jsx";
import TextField from "../ui/TextField.jsx";
import styles from "../ui/SimpleForm.module.css";

/**
 * Alta y edición de un servicio del catálogo (solo administrador).
 * `categorias` son las ya usadas, para sugerirlas y no crear variantes
 * del mismo nombre ("Bodas" y "Boda"). `invitadosIncluidos` viene de
 * /api/salon y se muestra como ayuda junto al precio.
 */
export default function ServicioForm({
  initialValues = SERVICIO_FORM_VACIO,
  categorias = [],
  invitadosIncluidos,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const listaId = useId();
  const { values, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef } = useFormulario({
    initialValues,
    validate: validateServicioForm,
    onSubmit: (datos) =>
      onSubmit({
        nombre: datos.nombre.trim(),
        categoria: datos.categoria.trim(),
        descripcion: datos.descripcion.trim(),
        precio: Number(datos.precio),
      }),
  });

  const campo = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errorVisible(name),
  });

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit}>
      <TextField label="Nombre" required {...campo("nombre")} />
      <div className={styles.fila}>
        <TextField
          label="Categoría"
          hint="Por ejemplo: Cumpleaños, Bodas."
          list={listaId}
          autoComplete="off"
          required
          {...campo("categoria")}
        />
        <TextField
          label="Precio (ARS)"
          hint={invitadosIncluidos ? `Incluye hasta ${invitadosIncluidos} invitados.` : undefined}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          required
          {...campo("precio")}
        />
      </div>
      <datalist id={listaId}>
        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </datalist>
      <TextAreaField label="Descripción" hint="Opcional, hasta 200 caracteres." maxLength={200} {...campo("descripcion")} />

      <div className={styles.acciones}>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={enviando}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="secondary" loading={enviando}>
          {enviando ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
