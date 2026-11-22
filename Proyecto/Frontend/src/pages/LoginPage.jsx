import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import AlertCircleIcon from "../assets/icons/alert-circle.svg?react";
import InfoIcon from "../assets/icons/info.svg?react";
import LogInIcon from "../assets/icons/log-in.svg?react";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useFormulario } from "../hooks/useFormulario.js";
import { useToast } from "../hooks/useToast.js";
import { cx } from "../utils/classNames.js";
import { getDestinoTrasIngresar, paths } from "../utils/routes.js";
import { validateLoginForm } from "../utils/validators.js";
import formStyles from "../components/ui/SimpleForm.module.css";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  useDocumentTitle("Ingresar");

  const { usuario, login } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [errorApi, setErrorApi] = useState(null);
  const vieneDeOtraPantalla = Boolean(location.state?.desde);

  const { values, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef } = useFormulario({
    initialValues: { email: "", password: "" },
    validate: validateLoginForm,
    onSubmit: async (credenciales) => {
      setErrorApi(null);
      try {
        const logueado = await login({ email: credenciales.email.trim(), password: credenciales.password });
        toast.success(`¡Hola, ${logueado.nombre}!`, "Ingresaste a tu cuenta.");
      } catch (error) {
        setErrorApi(error.message);
      }
    },
  });

  // Con la sesión abierta (recién ingresó o ya estaba logueado) se va al destino.
  if (usuario) {
    return <Navigate to={getDestinoTrasIngresar(location)} replace />;
  }

  return (
    <>
      <PageHeader eyebrow="Tu cuenta" title="Ingresar" description="Entrá para pedir una fecha y seguir tus reservas." />

      <div className={cx("container", styles.contenido)}>
        <div className={styles.tarjeta}>
          {vieneDeOtraPantalla && (
            <p className={styles.aviso}>
              <InfoIcon className={styles.avisoIcon} />
              Para continuar necesitás iniciar sesión. Si todavía no tenés cuenta, creala en un minuto.
            </p>
          )}

          <form ref={formRef} className={formStyles.form} noValidate onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errorVisible("email")}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errorVisible("password")}
              required
            />

            {errorApi && (
              <p className={styles.error} role="alert">
                <AlertCircleIcon className={styles.avisoIcon} />
                {errorApi}
              </p>
            )}

            <Button type="submit" variant="secondary" icon={LogInIcon} loading={enviando} fullWidth>
              {enviando ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <p className={styles.alternativa}>
            ¿No tenés cuenta?{" "}
            <Link to={paths.registro} state={location.state}>
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
