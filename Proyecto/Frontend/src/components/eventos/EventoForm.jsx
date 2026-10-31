import { useId, useMemo, useRef, useState } from "react";
import InfoIcon from "../../assets/icons/info.svg?react";
import { useToast } from "../../hooks/useToast.js";
import { getTodayISO } from "../../utils/dates.js";
import { formValuesToPayload } from "../../utils/eventos.js";
import { formatNombreCompleto } from "../../utils/formatters.js";
import { validateEventoForm } from "../../utils/validators.js";
import Button from "../ui/Button.jsx";
import SelectField from "../ui/SelectField.jsx";
import TextField from "../ui/TextField.jsx";
import ServicioPicker from "./ServicioPicker.jsx";
import styles from "./EventoForm.module.css";

// Orden en el que aparecen los campos: se usa para enfocar el primero con error.
const CAMPOS = ["clienteId", "cantidadInvitados", "servicioId", "fecha", "horaInicio", "horaFin"];

/**
 * Formulario de Evento, compartido por "Nuevo evento" y "Editar evento".
 * Valida en el navegador con las mismas reglas que la API y recién entonces
 * llama a `onSubmit` con los datos listos para enviar. La pantalla que lo usa
 * decide qué servicio llamar y qué hacer después.
 */
export default function EventoForm({ initialValues, clientes, servicios, submitLabel, onSubmit, cancelTo, nota }) {
  const [values, setValues] = useState(initialValues);
  const [tocados, setTocados] = useState({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);
  const notaId = useId();
  const toast = useToast();

  const errores = useMemo(() => validateEventoForm(values), [values]);

  // Los errores aparecen cuando el usuario sale del campo o intenta enviar,
  // no mientras recién empieza a escribir.
  const errorVisible = (campo) => (tocados[campo] || intentoEnviar ? errores[campo] : undefined);

  const opcionesClientes = useMemo(
    () =>
      clientes.map((cliente) => ({
        value: String(cliente.id),
        label: `${formatNombreCompleto(cliente)} · ${cliente.email}`,
      })),
    [clientes]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((actuales) => ({ ...actuales, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTocados((actuales) => (actuales[name] ? actuales : { ...actuales, [name]: true }));
  }

  function enfocarCampo(nombre) {
    const elemento = formRef.current?.elements.namedItem(nombre);
    // Los radio buttons llegan como RadioNodeList: se enfoca el primero.
    const destino = elemento instanceof RadioNodeList ? elemento[0] : elemento;
    destino?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIntentoEnviar(true);

    const camposConError = CAMPOS.filter((campo) => errores[campo]);
    if (camposConError.length > 0) {
      enfocarCampo(camposConError[0]);
      toast.error(
        "Revisá los datos del formulario",
        camposConError.length === 1 ? "Hay un campo con error." : `Hay ${camposConError.length} campos con errores.`
      );
      return;
    }

    setEnviando(true);
    try {
      await onSubmit(formValuesToPayload(values));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit} aria-describedby={notaId}>
      <p id={notaId} className={styles.obligatorios}>
        Todos los campos son obligatorios.
      </p>

      <div className={styles.fila}>
        <SelectField
          label="Cliente"
          hint="Quién hace la reserva."
          name="clienteId"
          value={values.clienteId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorVisible("clienteId")}
          options={opcionesClientes}
          placeholder="Elegí un cliente"
          required
        />
        <TextField
          label="Cantidad de invitados"
          hint="Contando adultos y chicos."
          type="number"
          name="cantidadInvitados"
          inputMode="numeric"
          min="1"
          step="1"
          value={values.cantidadInvitados}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errorVisible("cantidadInvitados")}
          required
        />
      </div>

      <ServicioPicker
        servicios={servicios}
        name="servicioId"
        value={values.servicioId}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errorVisible("servicioId")}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Fecha y horario</legend>
        <p className={styles.ayuda}>El evento tiene que empezar y terminar el mismo día, antes de la medianoche.</p>
        <div className={styles.filaTres}>
          <TextField
            label="Fecha"
            type="date"
            name="fecha"
            min={getTodayISO()}
            value={values.fecha}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorVisible("fecha")}
            required
          />
          <TextField
            label="Hora de inicio"
            type="time"
            name="horaInicio"
            value={values.horaInicio}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorVisible("horaInicio")}
            required
          />
          <TextField
            label="Hora de finalización"
            type="time"
            name="horaFin"
            value={values.horaFin}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errorVisible("horaFin")}
            required
          />
        </div>
      </fieldset>

      {nota && (
        <aside className={styles.nota}>
          <InfoIcon className={styles.notaIcon} />
          <div>{nota}</div>
        </aside>
      )}

      <div className={styles.acciones}>
        <Button to={cancelTo} variant="outline">
          Volver
        </Button>
        <Button type="submit" loading={enviando}>
          {enviando ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
