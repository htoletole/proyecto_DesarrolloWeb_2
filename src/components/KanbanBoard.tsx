import EstadoTareas from "../components/EstadoTareas";

function KanbanBoard() {
  const tareasTemp = [
    {
      nombre: "Tarea con nombre muy muy largo",
      estado: "pendiente",
      descripcion: "Realizar la tarea 1 bla bla bla bla bla bla bla bla bla",
    },
    {
      nombre: "Tarea 2",
      estado: "pendiente",
      descripcion: "Realizar la tarea 2 bla bla bla",
    },
    {
      nombre: "Tarea 3",
      estado: "enProgreso",
      descripcion: "Realizar la tarea 3 bla bla bla",
    },
    {
      nombre: "Tarea 4",
      estado: "enProgreso",
      descripcion: "Realizar la tarea 4 bla bla bla",
    },
  ];

  const tareasPendientes = tareasTemp.filter(
    (tarea) => tarea.estado === "pendiente",
  );
  const tareasProgreso = tareasTemp.filter(
    (tarea) => tarea.estado === "enProgreso",
  );
  const tareasCompletadas = tareasTemp.filter(
    (tarea) => tarea.estado === "completada",
  );

  return (
    <div className="container panel-estados">
      <EstadoTareas
        estadoClase="pendientes"
        estado="Pendientes"
        tareas={tareasPendientes}
      />
      <EstadoTareas
        estadoClase="en-progreso"
        estado="En progreso"
        tareas={tareasProgreso}
      />
      <EstadoTareas
        estadoClase="completadas"
        estado="Completadas"
        tareas={tareasCompletadas}
      />
    </div>
  );
}

export default KanbanBoard;
