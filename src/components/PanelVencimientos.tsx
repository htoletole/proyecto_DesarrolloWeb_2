import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import type { ElementoResumen, Resumen } from "../services/dashboardApi";
import { fechaCorta } from "../services/fechas";
import { colorComplementario } from "../services/colores";

interface PanelProps {
  resumen: Resumen | null;
}

interface EstadoResumenProps {
  estadoClase: string;
  titulo: string;
  elementos: ElementoResumen[];
  vacio: string;
  onTitulo: () => void;
  onElegir: (elemento: ElementoResumen) => void;
}

// misma forma que EstadoTareas: linea de color con el titulo y tarjetas que se deslizan
function EstadoResumen(props: EstadoResumenProps) {
  const { estadoClase, titulo, elementos, vacio, onTitulo, onElegir } = props;

  return (
    <div className="div-estado">
      <div
        className={`row g-0 d-flex justify-content-between linea-estado ${estadoClase} link-estados`}
        onClick={onTitulo}
      >
        <div className="col-auto">
          <h4>{titulo}</h4>
        </div>
        <div className="col-auto">›</div>
      </div>
      <div className="d-flex overflow-auto colores-claros">
        {elementos.length != 0 ? (
          elementos.map((elemento) => (
            <div
              key={elemento.id}
              onClick={() => onElegir(elemento)}
              className={`tarjeta-tarea ${estadoClase}`}
            >
              <h5 className="textos mb-0">{elemento.nombre}</h5>
              <span className="badge-prioridad">
                {elemento.fecha ? fechaCorta(elemento.fecha) : "Sin fecha"}
                {elemento.detalle !== "" && " · " + elemento.detalle}
              </span>
              <p className="textos mb-0">{elemento.ramo}</p>
              <p className="mas-info">Click para más info</p>
            </div>
          ))
        ) : (
          <div className="sin-tareas">
            <h5>{vacio}</h5>
          </div>
        )}
      </div>
    </div>
  );
}

// cumplimiento, vencimientos y proximas evaluaciones del inicio (los datos vienen de /dashboard)
function PanelVencimientos(props: PanelProps) {
  const { resumen } = props;
  const navigate = useNavigate();

  if (!resumen) return null;

  const irATarea = (elemento: ElementoResumen) => navigate(`/tareas?id=${elemento.id}`);
  const irAEvaluaciones = () => navigate("/evaluaciones");

  const { cumplimiento, avancePorRamo } = resumen;

  return (
    <>
      {/* mismo diseño que el panel de progreso global, con un medidor por ramo */}
      <div className="d-flex flex-column align-items-center panel-progreso-semanal panel-cumplimiento">
        <h3>Cumplimiento</h3>
        {cumplimiento.porcentaje === null ? (
          <p>Aún no completas tareas con fecha</p>
        ) : (
          <p>
            Entregaste a tiempo el {cumplimiento.porcentaje}% de tus tareas
          </p>
        )}
        <p>Avance de tareas por ramo</p>

        <div className="row w-100">
          {avancePorRamo.map((ramo) => (
            <div key={ramo.id} className="col-6 p-0 d-flex flex-column align-items-center">
              <ProgressBar porcentaje={ramo.porcentajeTareas} color={ramo.color} />
              <p
                className="tareas tareas-ramo"
                style={{ backgroundColor: ramo.color, color: colorComplementario(ramo.color) }}
              >
                {ramo.nombre}
                {ramo.promedioParcial !== null && " · " + ramo.promedioParcial.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="container panel-estados panel-vencimientos">
        <EstadoResumen
          estadoClase="vencidas"
          titulo="Vencidas"
          elementos={resumen.vencidas}
          vacio="No tienes tareas atrasadas."
          onTitulo={() => navigate("/tareas")}
          onElegir={irATarea}
        />
        <EstadoResumen
          estadoClase="vencen-semana"
          titulo="Vencen esta semana"
          elementos={resumen.proximas}
          vacio="Nada vence en los próximos 7 días."
          onTitulo={() => navigate("/tareas")}
          onElegir={irATarea}
        />
        <EstadoResumen
          estadoClase="proximas-evaluaciones"
          titulo="Próximas evaluaciones"
          elementos={resumen.proximasEvaluaciones}
          vacio="No hay evaluaciones en las próximas 2 semanas."
          onTitulo={irAEvaluaciones}
          onElegir={irAEvaluaciones}
        />
      </div>
    </>
  );
}

export default PanelVencimientos;
