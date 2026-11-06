import { useState, useEffect } from "react";
import HeaderDashboard from "../components/HeaderFlotante";
import WeeklyProgressPanel from "../components/WeeklyProgressPanel";
import KanbanBoard from "../components/KanbanBoard";
import PanelVencimientos from "../components/PanelVencimientos";
import PanelAvance from "../components/PanelAvance";
import ActividadReciente from "../components/ActividadReciente";
import EstadoCarga from "../components/EstadoCarga";
import { listarActividad, obtenerResumen } from "../services/panelApi";
import { listarTareas } from "../services/tareasApi";
import type { Actividad, Prioridad, ResumenDashboard, Tarea } from "../services/tipos";
import { useSesion } from "../services/useSesion";
import "../styles/dashboard.css";

function Dashboard() {
  const sesion = useSesion();
  const username = "qué gusto verte"

  // datos que vienen de la API
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const [listaTareas, datosResumen, listaActividad] = await Promise.all([
        listarTareas(),
        obtenerResumen(),
        listarActividad(8),
      ]);
      setTareas(listaTareas);
      setResumen(datosResumen);
      setActividad(listaActividad);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  // se carga al entrar y cada vez que cambia el usuario
  useEffect(() => {
    if (sesion) {
      cargar();
    }
  }, [sesion?.id]);

  const ordenPrioridad: Record<Prioridad, number> = {
    URGENTE: 1,
    ALTA: 2,
    MEDIA: 3,
    BAJA: 4,
  };

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    return ordenPrioridad[a.prioridad] - ordenPrioridad[b.prioridad];
  });

  const tareasPendientes = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "PENDIENTE",
  );
  const tareasProgreso = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "EN_PROGRESO",
  );
  const tareasCompletadas = tareasOrdenadas.filter(
    (tarea) => tarea.estado === "COMPLETADA",
  );

  return (
    <div className="min-vh-100 w-100 p-2 fondo-dashboard">
      <HeaderDashboard username={sesion ? sesion.username : username} titulo="¡Hola, " />

      <EstadoCarga cargando={cargando} error={error} onReintentar={cargar} />

      {!cargando && error === "" && (
        <>
          <WeeklyProgressPanel
            pendientes={tareasPendientes.length}
            enProgreso={tareasProgreso.length}
            completadas={tareasCompletadas.length}
          />
          {resumen && (
            <div className="dashboard-paneles">
              <PanelVencimientos resumen={resumen} />
              <PanelAvance resumen={resumen} />
            </div>
          )}
          <ActividadReciente actividad={actividad} />
          <KanbanBoard
            pendientes={tareasPendientes}
            enProgreso={tareasProgreso}
            completadas={tareasCompletadas}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
