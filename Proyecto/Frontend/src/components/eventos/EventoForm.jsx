import { useCallback, useId, useMemo } from "react";
import InfoIcon from "../../assets/icons/info.svg?react";
import { useFormulario } from "../../hooks/useFormulario.js";
import { getTodayISO } from "../../utils/dates.js";
import { formValuesToPayload } from "../../utils/eventos.js";
import { formatNombreCompleto } from "../../utils/formatters.js";
import { validateEventoForm } from "../../utils/validators.js";
import Button from "../ui/Button.jsx";
import SelectField from "../ui/SelectField.jsx";
import TextField from "../ui/TextField.jsx";
import DisponibilidadDelDia from "./DisponibilidadDelDia.jsx";
import EstimacionPresupuesto from "./EstimacionPresupuesto.jsx";
import ServicioPicker from "./ServicioPicker.jsx";
import styles from "./EventoForm.module.css";

/**
 * Formulario de Evento, compartido por "Nuevo evento" y "Editar evento".
 * Valida en el navegador con las mismas reglas que la API y recién entonces
 * llama a `onSubmit` con los datos listos para enviar. La pantalla que lo usa
 * decide qué servicio llamar y qué hacer después.
 *
 * - `clientes`: si se pasa, se muestra el selector de cliente (lo usa el
 *   administrador). Un cliente reserva siempre a su nombre y no lo ve.
 * - `capacidadMaxima`: aforo del salón, viene de /api/salon.
 */
export default function EventoForm({
  initialValues,
  clientes,
  servicios,
  capacidadMaxima,
  submitLabel,
  onSubmit,
  cancelTo,
  nota,
}) {
  const notaId = useId();
  const eligeCliente = Boolean(clientes);

  const validate = useCallback(
    (values) => validateEventoForm(values, { requiereCliente: eligeCliente, capacidadMaxima }),
    [eligeCliente, capacidadMaxima]
  );

  const { values, errores, errorVisible, handleChange, handleBlur, handleSubmit, enviando, formRef } = useFormulario({
    initialValues,
    validate,
    onSubmit: (datos) => onSubmit(formValuesToPayload(datos, { incluirCliente: eligeCliente })),
  });

  const opcionesClientes = useMemo(
    () =>
      (clientes ?? []).map((cliente) => ({
        value: String(cliente.id),
        label: `${formatNombreCompleto(cliente)} · ${cliente.email}`,
      })),
    [clientes]
  );

  // Ayudas en vivo: solo se consultan cuando los datos que necesitan son válidos.
  const fechaValida = Boolean(values.fecha) && !errores.fecha;
  const puedeEstimar = Boolean(values.servicioId && values.cantidadInvitados) && !errores.cantidadInvitados;

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit} aria-describedby={notaId}>
      <p id={notaId} className={styles.obligatorios}>
        Todos los campos son obligatorios.
      </p>

      <div className={eligeCliente ? styles.fila : styles.filaSimple}>
        {eligeCliente && (
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
        )}
        <TextField
          label="Cantidad de invitados"
          hint={capacidadMaxima ? `Contando adultos y chicos. Máximo ${capacidadMaxima}.` : "Contando adultos y chicos."}
          type="number"
          name="cantidadInvitados"
          inputMode="numeric"
          min="1"
          max={capacidadMaxima}
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
        {fechaValida && (
          <DisponibilidadDelDia fecha={values.fecha} horaInicio={values.horaInicio} horaFin={values.horaFin} />
        )}
      </fieldset>

      {puedeEstimar && (
        <EstimacionPresupuesto servicioId={values.servicioId} cantidadInvitados={values.cantidadInvitados} />
      )}

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
