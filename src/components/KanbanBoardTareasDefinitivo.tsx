import iconoReloj from "../assets/icons/reloj.png";
import iconoGrafico from "../assets/icons/grafico.png";
import iconoBaja from "../assets/icons/baja.png";
import iconoNormal from "../assets/icons/normal.png";
import iconoAlta from "../assets/icons/alta.png";
import iconoUrgente from "../assets/icons/urgente.png";
import iconoCheck from "../assets/icons/check.png";
import type { Tarea } from "../pages/Tareas";
import { colorComplementario } from "../services/colores";

interface TarjetaProps {
  tarea: Tarea;
  modoEdicion: boolean;
  seleccionada: boolean;
  onToggle: (id: string) => void;
  onVerDetalle?: (tarea: Tarea) => void;
  colorRamo?: string;
}

function TarjetaTarea({
  tarea,
  modoEdicion,
  seleccionada,
  onToggle,
  onVerDetalle,
  colorRamo,
}: TarjetaProps) {
  // la tarjeta toma el color de su ramo y el texto va en el color complementario
  // (si esta seleccionada se deja el verde de seleccion)
  let fondo = undefined;
  let texto = undefined;
  if (colorRamo && !seleccionada) {
    fondo = colorRamo;
    texto = colorComplementario(colorRamo);
  }

  return (
    <div
      className={`tarjeta-tarea ${seleccionada ? "seleccionada" : ""} ${modoEdicion ? "modo-edicion" : ""}`}
      style={{ backgroundColor: fondo }}
      onClick={() => {
        if (modoEdicion) {
          onToggle(tarea.id);
        } else if (onVerDetalle) {
          onVerDetalle(tarea);
        }
      }}
    >
      <h4 className="tarjeta-tarea-titulo" style={{ color: texto }}>{tarea.nombre}</h4>
      <span className="tarjeta-tarea-subtitulo" style={{ color: texto }}>{tarea.asignatura}</span>
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
  coloresRamos?: Record<string, string>;
}

function KanbanBoardTareas({
  tareas = [],
  ramos = [],
  modoEdicion = false,
  tareasSeleccionadas = [],
  onToggleSeleccion = () => {},
  onVerDetalle,
  filtro = "",
  coloresRamos = {},
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

        // al filtrar por ramo, el encabezado tambien toma el color del ramo
        const colorSeccion = propiedadFiltro === "asignatura" ? coloresRamos[seccion.id] : undefined;

        return (
          <div key={seccion.id} className="kanban-row">
            <div
              className="kanban-header"
              style={colorSeccion ? { backgroundColor: colorSeccion } : undefined}
            >
              <h3 style={colorSeccion ? { color: colorComplementario(colorSeccion) } : undefined}>
                {seccion.id}
              </h3>
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
                    colorRamo={coloresRamos[tarea.asignatura]}
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
