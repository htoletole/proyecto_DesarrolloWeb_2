import type { Actividad } from "../services/tipos";

interface ActividadRecienteProps {
  actividad: Actividad[];
}

// icono segun la accion que se hizo
const ICONOS: Record<string, string> = {
  CREAR: "＋",
  EDITAR: "✎",
  ELIMINAR: "✕",
  COMPLETAR: "✓",
  INGRESAR: "→",
};

// historial de actividad y cambios (viene de MongoDB)
function ActividadReciente({ actividad }: ActividadRecienteProps) {
  return (
    <div className="panel-dashboard">
      <h3>Actividad reciente</h3>

      {actividad.length === 0 && <p className="panel-vacio">Aún no hay actividad registrada.</p>}

      <ul className="lista-actividad">
        {actividad.map((item) => (
          <li key={item._id}>
            <span className={`actividad-icono actividad-${item.accion.toLowerCase()}`}>{ICONOS[item.accion] ?? "•"}</span>
            <span className="actividad-texto">{item.descripcion}</span>
            <span className="actividad-fecha">
              {new Date(item.fecha).toLocaleString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActividadReciente;
