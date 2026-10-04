import EstadoTareas from "../components/EstadoTareas";

function KanbanBoard() {
  return (
    <div className="container panel-estados">
      <EstadoTareas estado="pendientes" />
      <EstadoTareas estado="en-progreso" />
      <EstadoTareas estado="completadas" />
    </div>
  );
}

export default KanbanBoard;
