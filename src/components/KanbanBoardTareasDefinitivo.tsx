import iconoReloj from "../assets/icons/reloj.png";
import iconoGrafico from "../assets/icons/grafico.png";
import iconoBaja from "../assets/icons/baja.png";
import iconoNormal from "../assets/icons/normal.png";
import iconoAlta from "../assets/icons/alta.png";
import iconoUrgente from "../assets/icons/urgente.png";
import iconoCheck from "../assets/icons/check.png";
import type { RamoResumen, Tarea } from "../services/tipos";

interface TarjetaProps {
  tarea: Tarea;
  modoEdicion: boolean;
  seleccionada: boolean;
  onToggle: (id: number) => void;
  onVerDetalle?: (tarea: Tarea) => void;
}

function TarjetaTarea({
  tarea,
  modoEdicion,
  seleccionada,
  onToggle,
  onVerDetalle,
}: TarjetaProps) {
  // cuantas subtareas estan listas, para mostrar el avance en la tarjeta
  const listas = tarea.subtareas.filter((subtarea) => subtarea.completada).length;

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
      <span className="tarjeta-tarea-subtitulo">{tarea.asignatura.nombre}</span>
      {tarea.subtareas.length > 0 && (
        <span className="tarjeta-tarea-subtareas">
          {listas}/{tarea.subtareas.length} subtareas
        </span>
      )}
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
  titulo: string;
  icono?: string;
}

interface KanbanProps {
  tareas?: Tarea[];
  ramos?: RamoResumen[];
  modoEdicion?: boolean;
  tareasSeleccionadas?: number[];
  onToggleSeleccion?: (id: number) => void;
  onVerDetalle?: (tarea: Tarea) => void;
  filtro?: string;
}

// valor de la tarea que se compara con cada columna segun el filtro elegido
function valorSegunFiltro(tarea: Tarea, filtro: string): string {
  if (filtro === "normal") return tarea.estado;
  if (filtro === "prioridad") return tarea.prioridad;
  return String(tarea.asignaturaId);
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
  let secciones: SeccionFiltro[];

  if (filtro === "normal") {
    secciones = [
      { id: "PENDIENTE", titulo: "Pendiente", icono: iconoReloj },
      { id: "EN_PROGRESO", titulo: "En progreso", icono: iconoGrafico },
      { id: "COMPLETADA", titulo: "Completada", icono: iconoCheck },
    ];
  } else if (filtro === "prioridad") {
    secciones = [
      { id: "BAJA", titulo: "Baja", icono: iconoBaja },
      { id: "MEDIA", titulo: "Media", icono: iconoNormal },
      { id: "ALTA", titulo: "Alta", icono: iconoAlta },
      { id: "URGENTE", titulo: "Urgente", icono: iconoUrgente },
    ];
  } else {
    secciones = ramos.map((ramo) => {
      return { id: String(ramo.id), titulo: ramo.nombre };
    });
  }

  return (
    <div className="kanban-board">
      {secciones.map((seccion) => {
        const tareasColumna = tareas.filter(
          (tarea) => valorSegunFiltro(tarea, filtro) === seccion.id
        );

        return (
          <div key={seccion.id} className="kanban-row">
            <div className="kanban-header">
              <h3>{seccion.titulo}</h3>
              {seccion.icono && (
                <img
                  src={seccion.icono}
                  alt="Icono de sección"
                  className="kanban-icon-img"
                />
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
