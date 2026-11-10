import { useState, useEffect } from "react";
import HeaderDashboard from "../components/HeaderFlotante";
import WeeklyProgressPanel from "../components/WeeklyProgressPanel";
import KanbanBoard from "../components/KanbanBoard";
import type { Tarea } from "./Tareas";
import { useSesion } from "../services/useSesion";
import { listarTareas } from "../services/tareasApi";
import "../styles/dashboard.css";

function Dashboard() {
  const sesion = useSesion();
  const username = "qué gusto verte"
  
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // las tareas se piden a la API cuando hay una sesion iniciada
  useEffect(() => {
    if (!sesion) return;

    listarTareas()
      .then((lista) => setTareas(lista))
      .catch((error) => console.error("Error al cargar tareas:", error));
  }, [sesion?.id]);

  const ordenPrioridad: Record<Tarea["prioridad"], number> = {
    Urgente: 1,
    Alta: 2,
    Media: 3,
    Baja: 4,
  };

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    return ordenPrioridad[a.prioridad] - ordenPrioridad[b.prioridad];
  });

  const tareasPendientes = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "Pendiente",
  );
  const tareasProgreso = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "En progreso",
  );
  const tareasCompletadas = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "Completada",
  );

  return (
    <div className="min-vh-100 w-100 p-2 fondo-dashboard">
      <HeaderDashboard username={sesion ? sesion.username : username} titulo="¡Hola, " />
      <WeeklyProgressPanel
        pendientes={tareasPendientes.length}
        enProgreso={tareasProgreso.length}
        completadas={tareasCompletadas.length}
      />
      <KanbanBoard
        pendientes={tareasPendientes}
        enProgreso={tareasProgreso}
        completadas={tareasCompletadas}
      />
    </div>
  );
}

export default Dashboard;
