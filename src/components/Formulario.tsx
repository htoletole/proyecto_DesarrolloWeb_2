import { useState } from "react";
import type { FormEvent } from "react";
import { ESTADOS, MODALIDADES, PRIORIDADES, TIPOS_EVALUACION, opcionesDe } from "../services/etiquetas";
import type { Opcion } from "../services/tipos";
import "../styles/formulario.css";

type TipoFormulario = "ramo" | "tarea" | "periodo" | "evaluacion";
type ModoFormulario = "crear" | "editar";

type FormularioProps = {
  abierto: boolean;
  tipo: TipoFormulario;
  modo: ModoFormulario;
  onCerrar: () => void;
  onAceptar?: (datos: Record<string, FormDataEntryValue>) => void;
  valoresIniciales?: Record<string, string>;
  opcionesAsignatura?: Opcion[];
  opcionesEvaluacion?: Opcion[];
  opcionesPeriodo?: Opcion[];
  // mensaje de la API cuando algo no se pudo guardar
  error?: string;
  enviando?: boolean;
};

const NOMBRES: Record<TipoFormulario, string> = {
  ramo: "Ramo",
  tarea: "Tarea",
  periodo: "Período",
  evaluacion: "Evaluación",
};

// arma las opciones de un select a partir de una lista
function Opciones({ lista }: { lista: Opcion[] }) {
  return (
    <>
      <option value="">Seleccionar</option>
      {lista.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.texto}
        </option>
      ))}
    </>
  );
}

const Formulario = ({
  abierto,
  tipo,
  modo,
  onCerrar,
  onAceptar,
  valoresIniciales = {},
  opcionesAsignatura = [],
  opcionesEvaluacion = [],
  opcionesPeriodo = [],
  error = "",
  enviando = false,
}: FormularioProps) => {
  if (!abierto) {
    return null;
  }

  const accion = modo === "crear" ? "Crea tu" : "Edita tu";

  const manejarSubmit = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    const datos = Object.fromEntries(formData.entries());
    onAceptar?.(datos);
  };

  return (
    <div className="formulario-overlay">
      <div
        className={`formulario-modal formulario-modal-${tipo}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="formulario-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar formulario"
        >
          ×
        </button>

        <h2 className="formulario-titulo">
          {accion} <span>{NOMBRES[tipo]}</span>
        </h2>

        <form className="formulario-contenido" onSubmit={manejarSubmit}>
          {tipo === "ramo" && <CamposRamo valores={valoresIniciales} periodos={opcionesPeriodo} />}
          {tipo === "tarea" && (
            <CamposTarea valores={valoresIniciales} ramos={opcionesAsignatura} evaluaciones={opcionesEvaluacion} />
          )}
          {tipo === "periodo" && <CamposPeriodo valores={valoresIniciales} />}
          {tipo === "evaluacion" && <CamposEvaluacion valores={valoresIniciales} />}

          {error !== "" && (
            <p className="formulario-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="formulario-aceptar" disabled={enviando}>
            {enviando ? "Guardando..." : "Aceptar"}
          </button>
        </form>
      </div>
    </div>
  );
};

interface CamposProps {
  valores: Record<string, string>;
}

function CamposRamo({ valores, periodos }: CamposProps & { periodos: Opcion[] }) {
  return (
    <>
      <label>
        Nombre:
        <input type="text" name="nombre" defaultValue={valores.nombre ?? ""} maxLength={60} required />
      </label>
      <label>
        ID:
        <input type="text" name="codigo" defaultValue={valores.codigo ?? ""} maxLength={20} required />
      </label>
      <label>
        Período:
        <select name="periodoId" defaultValue={valores.periodoId ?? ""} required>
          <Opciones lista={periodos} />
        </select>
      </label>
      <label>
        Modalidad:
        <select name="modalidad" defaultValue={valores.modalidad ?? ""} required>
          <Opciones lista={opcionesDe(MODALIDADES)} />
        </select>
      </label>
      <label>
        Seleccionar/cargar logo:
        <input type="file" name="logo" accept="image/*" className="formulario-logo" />
      </label>
      <label>
        Seleccionar color del ramo:
        <input
          type="color"
          name="colorRamo"
          defaultValue={valores.colorRamo ?? "#FFAE52"}
          className="formulario-color-picker"
        />
      </label>
    </>
  );
}

// la lista de evaluaciones cambia segun el ramo elegido
function CamposTarea({ valores, ramos, evaluaciones }: CamposProps & { ramos: Opcion[]; evaluaciones: Opcion[] }) {
  const [ramoElegido, setRamoElegido] = useState(valores.asignaturaId ?? "");
  const evaluacionesDelRamo = evaluaciones.filter((evaluacion) => evaluacion.grupo === ramoElegido);

  return (
    <>
      <label>
        Nombre:
        <input type="text" name="nombre" defaultValue={valores.nombre ?? ""} maxLength={80} required />
      </label>
      <label>
        Descripción:
        <textarea name="descripcion" defaultValue={valores.descripcion ?? ""} maxLength={500} />
      </label>
      <label>
        Asignatura:
        <select
          name="asignaturaId"
          defaultValue={valores.asignaturaId ?? ""}
          onChange={(evento) => setRamoElegido(evento.target.value)}
          required
        >
          <Opciones lista={ramos} />
        </select>
      </label>
      {evaluacionesDelRamo.length > 0 && (
        <label>
          Evaluación que prepara (opcional):
          <select name="evaluacionId" defaultValue={valores.evaluacionId ?? ""}>
            <option value="">Ninguna</option>
            {evaluacionesDelRamo.map((evaluacion) => (
              <option key={evaluacion.valor} value={evaluacion.valor}>
                {evaluacion.texto}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Estado:
        <select name="estado" defaultValue={valores.estado ?? ""} required>
          <Opciones lista={opcionesDe(ESTADOS)} />
        </select>
      </label>
      <label>
        Prioridad:
        <select name="prioridad" defaultValue={valores.prioridad ?? ""} required>
          <Opciones lista={opcionesDe(PRIORIDADES)} />
        </select>
      </label>
      <label>
        Fecha:
        <input type="date" name="fecha" defaultValue={valores.fecha ?? ""} required />
      </label>
      <label>
        Hora de entrega (Opcional):
        <input type="time" name="horaEntrega" defaultValue={valores.horaEntrega ?? ""} />
      </label>
    </>
  );
}

function CamposPeriodo({ valores }: CamposProps) {
  return (
    <>
      <label>
        Nombre:
        <input type="text" name="nombre" placeholder="Ejemplo: 2027-1" defaultValue={valores.nombre ?? ""} maxLength={20} required />
      </label>
      <label>
        Fecha de inicio:
        <input type="date" name="fechaInicio" defaultValue={valores.fechaInicio ?? ""} required />
      </label>
      <label>
        Fecha de término:
        <input type="date" name="fechaFin" defaultValue={valores.fechaFin ?? ""} required />
      </label>
    </>
  );
}

function CamposEvaluacion({ valores }: CamposProps) {
  return (
    <>
      <label>
        Nombre:
        <input type="text" name="nombre" placeholder="Ejemplo: Solemne 1" defaultValue={valores.nombre ?? ""} maxLength={60} required />
      </label>
      <label>
        Tipo:
        <select name="tipo" defaultValue={valores.tipo ?? ""} required>
          <Opciones lista={opcionesDe(TIPOS_EVALUACION)} />
        </select>
      </label>
      <label>
        Fecha:
        <input type="date" name="fecha" defaultValue={valores.fecha ?? ""} required />
      </label>
      <label>
        Ponderación (%):
        <input type="number" name="ponderacion" min={1} max={100} defaultValue={valores.ponderacion ?? ""} required />
      </label>
      <label>
        Nota (Opcional, de 1.0 a 7.0):
        <input type="number" name="nota" min={1} max={7} step={0.1} defaultValue={valores.nota ?? ""} />
      </label>
    </>
  );
}

export default Formulario;
