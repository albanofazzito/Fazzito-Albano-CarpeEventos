import { useFormulario } from "../../hooks/useFormulario.js";
import { CLIENTE_FORM_VACIO } from "../../utils/formularios.js";
import { validateClienteForm } from "../../utils/validators.js";
import Button from "../ui/Button.jsx";
import TextField from "../ui/TextField.jsx";
import styles from "../ui/SimpleForm.module.css";

/**
 * Datos de contacto de un cliente. Lo usan el alta y la edición del panel
 * de clientes (dentro de una ventana) y la pantalla "Mi cuenta".
 */
export default function ClienteForm({ initialValues = CLIENTE_FORM_VACIO, submitLabel, onSubmit, onCancel }) {
  const { values, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef } = useFormulario({
    initialValues,
    validate: validateClienteForm,
    onSubmit: (datos) =>
      onSubmit({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        telefono: datos.telefono.trim(),
        email: datos.email.trim(),
      }),
  });

  const campo = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errorVisible(name),
    required: true,
  });

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.fila}>
        <TextField label="Nombre" autoComplete="given-name" {...campo("nombre")} />
        <TextField label="Apellido" autoComplete="family-name" {...campo("apellido")} />
      </div>
      <TextField
        label="Teléfono / WhatsApp"
        hint="Con la característica, por ejemplo 11 5555-0101."
        type="tel"
        autoComplete="tel"
        {...campo("telefono")}
      />
      <TextField label="Email" type="email" autoComplete="email" {...campo("email")} />

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
