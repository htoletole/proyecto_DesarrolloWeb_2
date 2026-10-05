import type { Tarea } from "../services/tareasCalendario";

interface TareasDelDiaProps {
  titulo: string;
  tareas: Tarea[];
  feriado: string; // texto vacio si el dia no es feriado
  mensajeVacio: string;
  onElegir: (tarea: Tarea) => void;
}

function claseSegunEstado(estado: string): string {
  if (estado === "Completada") {
    return "cal-tarea cal-tarea-completada";
  } else if (estado === "En progreso") {
    return "cal-tarea cal-tarea-progreso";
  } else {
    return "cal-tarea cal-tarea-pendiente";
  }
}

function TareasDelDia(props: TareasDelDiaProps) {
  const { titulo, tareas, feriado, mensajeVacio, onElegir } = props;

  return (
    <section className="cal-dia-detalle">
      <h2>{titulo}</h2>

      {feriado !== "" && <p className="cal-aviso-feriado">Feriado: {feriado}</p>}

      {tareas.length === 0 && <p className="cal-sin-tareas">{mensajeVacio}</p>}

      {tareas.map((tarea) => (
        <button key={tarea.id} type="button" className={claseSegunEstado(tarea.estado)} onClick={() => onElegir(tarea)}>
          <span>{tarea.nombre}</span>
          <small>{tarea.horaEntrega}</small>
        </button>
      ))}
    </section>
  );
}

export default TareasDelDia;
