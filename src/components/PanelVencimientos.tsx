import { useNavigate } from "react-router-dom";
import type { ElementoResumen, Resumen } from "../services/dashboardApi";
import { fechaCorta } from "../services/fechas";

interface PanelProps {
  resumen: Resumen | null;
}

interface ListaProps {
  titulo: string;
  clase: string;
  elementos: ElementoResumen[];
  vacio: string;
  onElegir: (elemento: ElementoResumen) => void;
}

function ListaResumen(props: ListaProps) {
  const { titulo, clase, elementos, vacio, onElegir } = props;

  return (
    <div className={`resumen-bloque ${clase}`}>
      <h4>
        {titulo} <span>({elementos.length})</span>
      </h4>
      {elementos.length === 0 ? (
        <p className="resumen-vacio">{vacio}</p>
      ) : (
        elementos.map((elemento) => (
          <div key={elemento.id} className="resumen-item" onClick={() => onElegir(elemento)}>
            <span className="resumen-color" style={{ backgroundColor: elemento.color }} />
            <div className="resumen-textos">
              <strong>{elemento.nombre}</strong>
              <span>
                {elemento.ramo} · {elemento.fecha ? fechaCorta(elemento.fecha) : "sin fecha"}
                {elemento.detalle !== "" && " · " + elemento.detalle}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// pendientes y vencimientos del inicio (los datos vienen de /dashboard)
function PanelVencimientos(props: PanelProps) {
  const { resumen } = props;
  const navigate = useNavigate();

  if (!resumen) return null;

  const irATarea = (elemento: ElementoResumen) => navigate(`/tareas?id=${elemento.id}`);
  const irAEvaluaciones = () => navigate("/evaluaciones");

  const { cumplimiento } = resumen;

  return (
    <div className="container panel-vencimientos">
      <h3>Pendientes y vencimientos</h3>

      <ListaResumen
        titulo="Vencidas"
        clase="vencidas"
        elementos={resumen.vencidas}
        vacio="No tienes tareas atrasadas."
        onElegir={irATarea}
      />
      <ListaResumen
        titulo="Vencen esta semana"
        clase="proximas"
        elementos={resumen.proximas}
        vacio="Nada vence en los próximos 7 días."
        onElegir={irATarea}
      />
      <ListaResumen
        titulo="Próximas evaluaciones"
        clase="evaluaciones"
        elementos={resumen.proximasEvaluaciones}
        vacio="No hay evaluaciones en las próximas 2 semanas."
        onElegir={irAEvaluaciones}
      />

      <div className="resumen-bloque cumplimiento">
        <h4>Cumplimiento</h4>
        {cumplimiento.porcentaje === null ? (
          <p className="resumen-vacio">Todavía no completas tareas con fecha.</p>
        ) : (
          <p className="resumen-vacio">
            <strong>{cumplimiento.porcentaje}%</strong> de tus tareas las entregaste a tiempo ({cumplimiento.aTiempo} a
            tiempo, {cumplimiento.atrasadas} atrasadas).
          </p>
        )}

        {resumen.avancePorRamo.map((ramo) => (
          <div key={ramo.id} className="resumen-avance">
            <div className="resumen-avance-texto">
              <span>{ramo.nombre}</span>
              <span>
                {ramo.porcentajeTareas}%
                {ramo.promedioParcial !== null && " · prom. " + ramo.promedioParcial.toFixed(1)}
              </span>
            </div>
            <div className="resumen-avance-barra">
              <div style={{ width: ramo.porcentajeTareas + "%", backgroundColor: ramo.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PanelVencimientos;
