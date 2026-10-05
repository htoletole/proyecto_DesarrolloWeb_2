import type { FormEvent } from "react";
import "../styles/formulario.css";

type TipoFormulario = "ramo" | "tarea";
type ModoFormulario = "crear" | "editar";

type FormularioProps = {
  abierto: boolean;
  tipo: TipoFormulario;
  modo: ModoFormulario;
  onCerrar: () => void;
  onAceptar?: (
    datos: Record<string, FormDataEntryValue>,
  ) => void;
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
  if (!abierto) {
    return null;
  }

  const nombreElemento =
    tipo === "ramo"
      ? "Ramo"
      : "Tarea";

  const accion =
    modo === "crear"
      ? "Crea tu"
      : "Edita tu";

  const manejarSubmit = (
    evento: FormEvent<HTMLFormElement>,
  ) => {
    evento.preventDefault();
    const formData = new FormData(
      evento.currentTarget,
    );
    const datos = Object.fromEntries(
      formData.entries(),
    );
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
          {accion}{" "}
          <span>
            {nombreElemento}
          </span>
        </h2>

        <form
          className="formulario-contenido"
          onSubmit={manejarSubmit}
        >
          {tipo === "ramo" ? (
            <>
              <label>
                Nombre:
                <input
                  type="text"
                  name="nombre"
                  defaultValue={
                    valoresIniciales.nombre ?? ""
                  }
                  required
                />
              </label>
              <label>
                ID:
                <input
                  type="text"
                  name="id"
                  defaultValue={
                    valoresIniciales.id ?? ""
                  }
                  required
                />
              </label>
              <label>
                Modalidad:
                <select
                  name="modalidad"
                  defaultValue={
                    valoresIniciales.modalidad ?? ""
                  }
                  required
                >
                  <option value="">
                    Seleccionar
                  </option>
                  <option value="Online">
                    Online
                  </option>
                  <option value="Presencial">
                    Presencial
                  </option>
                  <option value="Asincrónico">
                    Asincrónico
                  </option>
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
                  defaultValue={
                    valoresIniciales.colorRamo ?? "#FFAE52"
                  }
                  className="formulario-color-picker"
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
                  defaultValue={
                    valoresIniciales.nombre ?? ""
                  }
                  required
                />
              </label>
              <label>
                Descripción:
                <textarea
                  name="descripcion"
                  defaultValue={
                    valoresIniciales.descripcion ?? ""
                  }
                />
              </label>
              <label>
                Asignatura:
                <select
                  name="asignatura"
                  defaultValue={
                    valoresIniciales.asignatura ?? ""
                  }
                  required
                >
                  <option value="">
                    Seleccionar
                  </option>
                  {opcionesAsignatura.map(
                    (asignatura) => (
                      <option
                        key={asignatura}
                        value={asignatura}
                      >
                        {asignatura}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Estado:
                <select
                  name="estado"
                  defaultValue={
                    valoresIniciales.estado ?? ""
                  }
                  required
                >
                  <option value="">
                    Seleccionar
                  </option>
                  <option value="Pendiente">
                    Pendiente
                  </option>
                  <option value="En progreso">
                    En progreso
                  </option>
                  <option value="Completada">
                    Completada
                  </option>
                </select>
              </label>
              <label>
                Prioridad:
                <select
                  name="prioridad"
                  defaultValue={
                    valoresIniciales.prioridad ?? ""
                  }
                  required
                >
                  <option value="">
                    Seleccionar
                  </option>
                  <option value="Baja">
                    Baja
                  </option>
                  <option value="Media">
                    Media
                  </option>
                  <option value="Alta">
                    Alta
                  </option>
                  <option value="Urgente">
                    Urgente
                  </option>
                </select>
              </label>
              
              {/* CAMBIO: Campo de fecha movido arriba y marcado como obligatorio */}
              <label>
                Fecha:
                <input
                  type="date"
                  name="fecha"
                  defaultValue={
                    valoresIniciales.fecha ?? ""
                  }
                  required
                />
              </label>

              <label>
                Hora de entrega (Opcional):
                <input
                  type="time"
                  name="horaEntrega"
                  defaultValue={
                    valoresIniciales.horaEntrega ?? ""
                  }
                />
              </label>
            </>
          )}

          <button
            type="submit"
            className="formulario-aceptar"
          >
            Aceptar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Formulario;