import { TIPOS_EVALUACION } from "../services/etiquetas";
import type { EstadoTarea, Evaluacion, Tarea } from "../services/tipos";

interface TareasDelDiaProps {
  titulo: string;
  tareas: Tarea[];
  evaluaciones?: Evaluacion[];
  feriado: string | null;
  mensajeVacio: string;
  onElegir: (tarea: Tarea) => void;
}

function claseSegunEstado(estado: EstadoTarea): string {
  if (estado === "COMPLETADA") {
    return "cal-tarea cal-tarea-completada";
  } else if (estado === "EN_PROGRESO") {
    return "cal-tarea cal-tarea-progreso";
  } else {
    return "cal-tarea cal-tarea-pendiente";
  }
}

function TareasDelDia(props: TareasDelDiaProps) {
  const { titulo, tareas, evaluaciones = [], feriado, mensajeVacio, onElegir } = props;

  return (
    <section className="cal-dia-detalle">
      <h2>{titulo}</h2>

      {feriado !== null && <p className="cal-aviso-feriado">Feriado: {feriado}</p>}

      {evaluaciones.map((evaluacion) => (
        <div key={"eval-" + evaluacion.id} className="cal-tarea cal-evaluacion">
          <span>
            {evaluacion.nombre} · {evaluacion.asignatura?.nombre}
          </span>
          <small>
            {TIPOS_EVALUACION[evaluacion.tipo]} {evaluacion.ponderacion}%
          </small>
        </div>
      ))}

      {tareas.length === 0 && evaluaciones.length === 0 && <p className="cal-sin-tareas">{mensajeVacio}</p>}

      {tareas.map((tarea) => (
        <button key={tarea.id} type="button" className={claseSegunEstado(tarea.estado)} onClick={() => onElegir(tarea)}>
          <span>
            {tarea.nombre} <small className="cal-tarea-ramo">{tarea.asignatura.nombre}</small>
          </span>
          <small>{tarea.horaEntrega}</small>
        </button>
      ))}
    </section>
  );
}

export default TareasDelDia;
