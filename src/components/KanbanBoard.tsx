import EstadoTareas from "../components/EstadoTareas";
import type { Tarea } from "../services/tipos";

interface BoardProps {
  pendientes: Tarea[];
  enProgreso: Tarea[];
  completadas: Tarea[];
}

function KanbanBoard(props: BoardProps) {
  const { pendientes, enProgreso, completadas } = props;

  return (
    <div className="container panel-estados">
      <EstadoTareas
        estadoClase="pendientes"
        estado="Pendientes"
        tareas={pendientes}
      />
      <EstadoTareas
        estadoClase="en-progreso"
        estado="En progreso"
        tareas={enProgreso}
      />
      <EstadoTareas
        estadoClase="completadas"
        estado="Completadas"
        tareas={completadas}
      />
    </div>
  );
}

export default KanbanBoard;
