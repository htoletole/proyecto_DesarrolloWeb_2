import type { ResumenDashboard } from "../services/tipos";

interface PanelAvanceProps {
  resumen: ResumenDashboard;
}

// seguimiento de avance y cumplimiento por ramo
function PanelAvance({ resumen }: PanelAvanceProps) {
  const { cumplimiento } = resumen;

  return (
    <div className="panel-dashboard">
      <h3>Avance y cumplimiento</h3>

      <p className="cumplimiento">
        {cumplimiento.porcentaje !== null ? (
          <>
            Entregaste a tiempo el <strong>{cumplimiento.porcentaje}%</strong> de tus tareas
            ({cumplimiento.aTiempo} a tiempo, {cumplimiento.atrasadas} atrasadas)
          </>
        ) : (
          <>Todavía no completas tareas con fecha de entrega.</>
        )}
      </p>

      {resumen.avancePorRamo.length === 0 && <p className="panel-vacio">No tienes ramos en el período actual.</p>}

      {resumen.avancePorRamo.map((ramo) => (
        <div key={ramo.id} className="avance-ramo">
          <div className="avance-ramo-titulo">
            <span>{ramo.nombre}</span>
            <span>
              {ramo.tareasCompletadas}/{ramo.totalTareas} tareas
              {ramo.promedioParcial !== null && <> · Prom. {ramo.promedioParcial.toFixed(1)}</>}
            </span>
          </div>
          <div className="avance-ramo-barra">
            <div style={{ width: ramo.porcentajeTareas + "%", backgroundColor: ramo.color }} />
          </div>
        </div>
      ))}

      {/* esto viene de MongoDB (eventos de planificacion) */}
      {resumen.masReprogramadas.length > 0 && (
        <>
          <h4>Lo que más has postergado</h4>
          <ul className="lista-postergadas">
            {resumen.masReprogramadas.map((item) => (
              <li key={item.entidad + item.entidadId}>
                {item.titulo} <span>movida {item.veces} {item.veces === 1 ? "vez" : "veces"}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default PanelAvance;
