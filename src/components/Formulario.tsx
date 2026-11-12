import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { colorComplementario, contraste } from "../services/colores";
import "../styles/formulario.css";

type TipoFormulario = "ramo" | "tarea" | "evaluacion" | "periodo";
type ModoFormulario = "crear" | "editar";

type FormularioProps = {
  abierto: boolean;
  tipo: TipoFormulario;
  modo: ModoFormulario;
  onCerrar: () => void;
  onAceptar?: (datos: Record<string, FormDataEntryValue>) => void;
  valoresIniciales?: Record<string, string>;
  opcionesAsignatura?: string[];
};

const Formulario = ({
  abierto,
  tipo,
  modo,
  onCerrar,
  onAceptar,
  valoresIniciales = {},
  opcionesAsignatura = [],
}: FormularioProps) => {
  // color elegido en el selector, para mostrar como se vera el texto encima
  const colorInicial = valoresIniciales.colorRamo ?? "#FFAE52";
  const [colorVista, setColorVista] = useState(colorInicial);

  // cada vez que se abre el formulario parte con el color del ramo
  useEffect(() => {
    if (abierto) setColorVista(colorInicial);
  }, [abierto, colorInicial]);

  if (!abierto) {
    return null;
  }

  const NOMBRES: Record<TipoFormulario, string> = {
    ramo: "Ramo",
    tarea: "Tarea",
    evaluacion: "Evaluación",
    periodo: "Período",
  };
  const nombreElemento = NOMBRES[tipo];

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
          {accion} <span>{nombreElemento}</span>
        </h2>

        <form className="formulario-contenido" onSubmit={manejarSubmit}>
          {tipo === "ramo" ? (
            <>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  defaultValue={valoresIniciales.nombre ?? ""}
                  required
                />
              </label>
              <label>
                ID:
                <input
                  type="text"
                  name="id"
                  defaultValue={valoresIniciales.id ?? ""}
                  required
                />
              </label>
              <label>
                Modalidad:
                <select
                  name="modalidad"
                  defaultValue={valoresIniciales.modalidad ?? ""}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Online">Online</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Asincrónico">Asincrónico</option>
                </select>
              </label>
              <label>
                Seleccionar/cargar logo:
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="formulario-logo"
                />
              </label>
              <label>
                Seleccionar color del ramo:
                <input
                  type="color"
                  name="colorRamo"
                  defaultValue={valoresIniciales.colorRamo ?? "#FFAE52"}
                  className="formulario-color-picker"
                  onChange={(e) => setColorVista(e.target.value)}
                />
              </label>

              {/* vista previa: el texto usa el color complementario para que siempre se lea */}
              <div
                className="formulario-vista-color"
                style={{ backgroundColor: colorVista, color: colorComplementario(colorVista) }}
              >
                <strong>Así se verá tu ramo</strong>
                <span>
                  Texto en color complementario · contraste{" "}
                  {contraste(colorVista, colorComplementario(colorVista)).toFixed(1)}:1
                </span>
              </div>
            </>
          ) : tipo === "tarea" ? (
            <>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  defaultValue={valoresIniciales.nombre ?? ""}
                  required
                />
              </label>
              <label>
                Descripción:
                <textarea
                  name="descripcion"
                  defaultValue={valoresIniciales.descripcion ?? ""}
                />
              </label>
              <label>
                Asignatura:
                <select
                  name="asignatura"
                  defaultValue={valoresIniciales.asignatura ?? ""}
                  required
                >
                  <option value="">Seleccionar</option>
                  {opcionesAsignatura.map((asignatura) => (
                    <option key={asignatura} value={asignatura}>
                      {asignatura}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estado:
                <select
                  name="estado"
                  defaultValue={valoresIniciales.estado ?? ""}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="Completada">Completada</option>
                </select>
              </label>
              <label>
                Prioridad:
                <select
                  name="prioridad"
                  defaultValue={valoresIniciales.prioridad ?? ""}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </label>

              {/* CAMBIO: Campo de fecha movido arriba y marcado como obligatorio */}
              <label>
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  defaultValue={valoresIniciales.fecha ?? ""}
                  required
                />
              </label>

              <label>
                Hora de entrega (Opcional):
                <input
                  type="time"
                  name="horaEntrega"
                  defaultValue={valoresIniciales.horaEntrega ?? ""}
                />
              </label>
            </>
          ) : tipo === "evaluacion" ? (
            <>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  defaultValue={valoresIniciales.nombre ?? ""}
                  placeholder="Ej: Solemne 1"
                  required
                />
              </label>
              <label>
                Ramo:
                {/* al editar no se cambia el ramo, la API no lo permite */}
                <select
                  name="asignatura"
                  defaultValue={valoresIniciales.asignatura ?? ""}
                  disabled={modo === "editar"}
                  required
                >
                  <option value="">Seleccionar</option>
                  {opcionesAsignatura.map((asignatura) => (
                    <option key={asignatura} value={asignatura}>
                      {asignatura}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo:
                <select
                  name="tipo"
                  defaultValue={valoresIniciales.tipo ?? ""}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="PRUEBA">Prueba</option>
                  <option value="CONTROL">Control</option>
                  <option value="TRABAJO">Trabajo</option>
                  <option value="PROYECTO">Proyecto</option>
                  <option value="EXAMEN">Examen</option>
                  <option value="PRESENTACION">Presentación</option>
                </select>
              </label>
              <label>
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  defaultValue={valoresIniciales.fecha ?? ""}
                  required
                />
              </label>
              <label>
                Ponderación (%):
                <input
                  type="number"
                  name="ponderacion"
                  min="1"
                  max="100"
                  defaultValue={valoresIniciales.ponderacion ?? ""}
                  required
                />
              </label>
              <label>
                Nota (Opcional, de 1.0 a 7.0):
                <input
                  type="number"
                  name="nota"
                  min="1"
                  max="7"
                  step="0.1"
                  defaultValue={valoresIniciales.nota ?? ""}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  defaultValue={valoresIniciales.nombre ?? ""}
                  placeholder="Ej: 2026-2"
                  required
                />
              </label>
              <label>
                Fecha de inicio:
                <input
                  type="date"
                  name="fechaInicio"
                  defaultValue={valoresIniciales.fechaInicio ?? ""}
                  required
                />
              </label>
              <label>
                Fecha de término:
                <input
                  type="date"
                  name="fechaFin"
                  defaultValue={valoresIniciales.fechaFin ?? ""}
                  required
                />
              </label>
            </>
          )}

          <button type="submit" className="formulario-aceptar">
            Aceptar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Formulario;
