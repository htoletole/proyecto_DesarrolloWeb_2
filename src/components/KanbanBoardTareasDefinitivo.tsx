import iconoReloj from "../assets/icons/reloj.png";
import iconoGrafico from "../assets/icons/grafico.png";

import iconoBaja from "../assets/icons/baja.png";
import iconoNormal from "../assets/icons/normal.png";
import iconoAlta from "../assets/icons/alta.png";
import iconoUrgente from "../assets/icons/urgente.png";

import iconoCalendario from "../assets/icons/calendario.png";

import iconoCheck from "../assets/icons/check.png";
import type { Tarea } from "../pages/Tareas";

interface TarjetaProps {
  tarea: Tarea;
  modoEdicion: boolean;
  seleccionada: boolean;
  onToggle: (id: string) => void;
  onVerDetalle?: (tarea: Tarea) => void;
}

function TarjetaTarea({
  tarea,
  modoEdicion,
  seleccionada,
  onToggle,
  onVerDetalle,
}: TarjetaProps) {
  return (
    <div
      className={`tarjeta-tarea ${seleccionada ? "seleccionada" : ""} ${modoEdicion ? "modo-edicion" : ""}`}
      onClick={() => {
        if (modoEdicion) {
          onToggle(tarea.id);
        } else if (onVerDetalle) {
          onVerDetalle(tarea);
        }
      }}
    >
      <h4 className="tarjeta-tarea-titulo">{tarea.nombre}</h4>
      <span className="tarjeta-tarea-subtitulo">{tarea.asignatura}</span>
      {seleccionada && (
        <img
          src={iconoCheck}
          alt="Seleccionada"
          className="icono-check-seleccion"
        />
      )}
    </div>
  );
}

interface SeccionFiltro {
  id: string;
  icono?: string;
}

interface KanbanProps {
  tareas?: Tarea[];
  ramos?: string[];
  modoEdicion?: boolean;
  tareasSeleccionadas?: string[];
  onToggleSeleccion?: (id: string) => void;
  onVerDetalle?: (tarea: Tarea) => void;
  filtro?: string;
}

function KanbanBoardTareas({
  tareas = [],
  ramos = [],
  modoEdicion = false,
  tareasSeleccionadas = [],
  onToggleSeleccion = () => {},
  onVerDetalle,
  filtro = "",
}: KanbanProps) {
  let secciones: SeccionFiltro[], propiedadFiltro: keyof Tarea;

  if (filtro === "normal") {
    propiedadFiltro = "estado";
    secciones = [
      { id: "Pendiente", icono: iconoReloj },
      { id: "En progreso", icono: iconoGrafico },
      { id: "Completada", icono: iconoCheck },
    ];
  } else if (filtro === "prioridad") {
    propiedadFiltro = "prioridad";
    secciones = [
      { id: "Baja", icono: iconoBaja },
      { id: "Media", icono: iconoNormal },
      { id: "Alta", icono: iconoAlta },
      { id: "Urgente", icono: iconoUrgente },
    ];
  } else if (filtro === "dia") {
    propiedadFiltro = "dia";
    secciones = [
      { id: "Lunes", icono: iconoCalendario },
      { id: "Martes", icono: iconoCalendario },
      { id: "Miercoles", icono: iconoCalendario },
      { id: "Jueves", icono: iconoCalendario },
      { id: "Viernes", icono: iconoCalendario },
    ];
  } else {
    propiedadFiltro = "asignatura";
    secciones = ramos.map((r) => {
      return { id: r };
    });
  }

  return (
    <div className="kanban-board">
      {secciones.map((seccion) => {
        const tareasColumna = tareas.filter(
          (t) => t[propiedadFiltro] === seccion.id,
        );
        return (
          <div key={seccion.id} className="kanban-row">
            <div className="kanban-header">
              {propiedadFiltro === "dia" ? (
                <>
                  {seccion.icono && (
                    <img
                      src={seccion.icono}
                      alt="Calendario"
                      className="kanban-icon-img"
                    />
                  )}
                  <h3>{seccion.id}</h3>
                </>
              ) : (
                <>
                  <h3>{seccion.id}</h3>
                  {seccion.icono && (
                    <img
                      src={seccion.icono}
                      alt="Calendario"
                      className="kanban-icon-img"
                    />
                  )}
                </>
              )}
            </div>
            <div className="kanban-cards-container">
              {tareasColumna.length > 0 ? (
                tareasColumna.map((tarea) => (
                  <TarjetaTarea
                    key={tarea.id}
                    tarea={tarea}
                    modoEdicion={modoEdicion}
                    seleccionada={tareasSeleccionadas.includes(tarea.id)}
                    onToggle={onToggleSeleccion}
                    onVerDetalle={onVerDetalle}
                  />
                ))
              ) : (
                <div className="task-card-placeholder"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoardTareas;
