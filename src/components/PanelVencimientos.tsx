import { useNavigate } from "react-router-dom";
import { PRIORIDADES, TIPOS_EVALUACION, fechaCortaTexto } from "../services/etiquetas";
import type { ResumenDashboard, Tarea } from "../services/tipos";

interface PanelVencimientosProps {
  resumen: ResumenDashboard;
}

// pendientes y vencimientos: lo atrasado, lo que vence en 7 dias y las proximas evaluaciones
function PanelVencimientos({ resumen }: PanelVencimientosProps) {
  const navigate = useNavigate();

  function filaTarea(tarea: Tarea, clase: string) {
    return (
      <li key={tarea.id} className={`vencimiento ${clase}`} onClick={() => navigate(`/tareas?id=${tarea.id}`)}>
        <span className="vencimiento-nombre">{tarea.nombre}</span>
        <span className="vencimiento-datos">
          {tarea.asignatura.nombre} · {fechaCortaTexto(tarea.fecha)} · {PRIORIDADES[tarea.prioridad]}
        </span>
      </li>
    );
  }

  return (
    <div className="panel-dashboard">
      <h3>Pendientes y vencimientos</h3>

      <h4>Vencidas ({resumen.vencidas.length})</h4>
      {resumen.vencidas.length > 0 ? (
        <ul className="lista-vencimientos">{resumen.vencidas.map((tarea) => filaTarea(tarea, "vencida"))}</ul>
      ) : (
        <p className="panel-vacio">No tienes tareas atrasadas. ¡Bien!</p>
      )}

      <h4>Vencen en los próximos 7 días ({resumen.proximas.length})</h4>
      {resumen.proximas.length > 0 ? (
        <ul className="lista-vencimientos">{resumen.proximas.map((tarea) => filaTarea(tarea, "proxima"))}</ul>
      ) : (
        <p className="panel-vacio">Nada por entregar esta semana.</p>
      )}

      <h4>Próximas evaluaciones</h4>
      {resumen.proximasEvaluaciones.length > 0 ? (
        <ul className="lista-vencimientos">
          {resumen.proximasEvaluaciones.map((evaluacion) => (
            <li key={evaluacion.id} className="vencimiento evaluacion" style={{ borderLeftColor: evaluacion.asignatura?.color }}>
              <span className="vencimiento-nombre">{evaluacion.nombre}</span>
              <span className="vencimiento-datos">
                {evaluacion.asignatura?.nombre} · {TIPOS_EVALUACION[evaluacion.tipo]} · {fechaCortaTexto(evaluacion.fecha)} · {evaluacion.ponderacion}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="panel-vacio">Sin evaluaciones en las próximas dos semanas.</p>
      )}
    </div>
  );
}

export default PanelVencimientos;
