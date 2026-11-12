import { useNavigate } from "react-router-dom";
import { TIPOS_EVALUACION } from "../services/evaluacionesApi";
import type { Evaluacion } from "../services/evaluacionesApi";

interface EvaluacionesDelDiaProps {
  evaluaciones: Evaluacion[];
}

// evaluaciones del dia elegido en el calendario (si no hay, no se muestra nada)
function EvaluacionesDelDia(props: EvaluacionesDelDiaProps) {
  const { evaluaciones } = props;
  const navigate = useNavigate();

  if (evaluaciones.length === 0) return null;

  return (
    <section className="cal-dia-detalle">
      <h2>Evaluaciones</h2>

      {evaluaciones.map((evaluacion) => (
        <button
          key={evaluacion.id}
          type="button"
          className="cal-tarea cal-evaluacion"
          onClick={() => navigate("/evaluaciones")}
        >
          <span>
            {evaluacion.nombre} · {evaluacion.ramo}
          </span>
          <small>
            {TIPOS_EVALUACION[evaluacion.tipo] ?? evaluacion.tipo} · {evaluacion.ponderacion}%
          </small>
        </button>
      ))}
    </section>
  );
}

export default EvaluacionesDelDia;
