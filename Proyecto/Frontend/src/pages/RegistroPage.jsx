import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import AlertCircleIcon from "../assets/icons/alert-circle.svg?react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useToast } from "../hooks/useToast.js";
import { cx } from "../utils/classNames.js";
import { getDestinoTrasIngresar, paths } from "../utils/routes.js";
import { PASSWORD_MIN_LENGTH, validateRegistroForm } from "../utils/validators.js";
import formStyles from "../components/ui/SimpleForm.module.css";
import styles from "./AuthPage.module.css";

const REGISTRO_VACIO = { nombre: "", apellido: "", telefono: "", email: "", password: "", confirmacion: "" };

/** Registro de clientes. Al terminar, la sesión queda abierta. */
export default function RegistroPage() {
  useDocumentTitle("Crear cuenta");

  const { usuario, registrar } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [errorApi, setErrorApi] = useState(null);

  const { values, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef } = useFormulario({
    initialValues: REGISTRO_VACIO,
    validate: validateRegistroForm,
    onSubmit: async (datos) => {
      setErrorApi(null);
      try {
        const nuevo = await registrar({
          nombre: datos.nombre.trim(),
          apellido: datos.apellido.trim(),
          telefono: datos.telefono.trim(),
          email: datos.email.trim(),
          password: datos.password,
        });
        toast.success(`¡Bienvenido/a, ${nuevo.nombre}!`, "Tu cuenta quedó creada. Ya podés pedir tu fecha.");
      } catch (error) {
        setErrorApi(error.message);
      }
    },
  });

  if (usuario) {
    return <Navigate to={getDestinoTrasIngresar(location)} replace />;
  }

  const campo = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errorVisible(name),
    required: true,
  });

  return (
    <>
      <PageHeader
        eyebrow="Tu cuenta"
        title="Crear una cuenta"
        description="Con tu cuenta pedís fechas, recibís el presupuesto y seguís cada reserva."
      />

      <div className={cx("container", styles.contenido)}>
        <div className={styles.tarjeta}>
          <form ref={formRef} className={formStyles.form} noValidate onSubmit={handleSubmit}>
            <p className={styles.obligatorios}>Todos los campos son obligatorios.</p>
            <div className={formStyles.fila}>
              <TextField label="Nombre" autoComplete="given-name" {...campo("nombre")} />
              <TextField label="Apellido" autoComplete="family-name" {...campo("apellido")} />
            </div>
            <TextField
              label="Teléfono / WhatsApp"
              hint="Te vamos a contactar por acá. Con la característica, por ejemplo 11 5555-0101."
              type="tel"
              autoComplete="tel"
              {...campo("telefono")}
            />
            <TextField label="Email" type="email" autoComplete="email" {...campo("email")} />
            <TextField
              label="Contraseña"
              hint={`Al menos ${PASSWORD_MIN_LENGTH} caracteres.`}
              type="password"
              autoComplete="new-password"
              {...campo("password")}
            />
            <TextField label="Repetí la contraseña" type="password" autoComplete="new-password" {...campo("confirmacion")} />

            {errorApi && (
              <p className={styles.error} role="alert">
                <AlertCircleIcon className={styles.avisoIcon} />
                {errorApi}
              </p>
            )}

            <Button type="submit" variant="secondary" loading={enviando} fullWidth>
              {enviando ? "Creando la cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className={styles.alternativa}>
            ¿Ya tenés cuenta?{" "}
            <Link to={paths.ingresar} state={location.state}>
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
