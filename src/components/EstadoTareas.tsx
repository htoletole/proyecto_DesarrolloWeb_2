import { useNavigate } from "react-router-dom";
import type { Tarea } from "../pages/Tareas";

interface EstadoProps {
  estadoClase: string;
  estado: string;
  tareas: Tarea[];
}

function EstadoTareas(props: EstadoProps) {
  const { estadoClase, estado, tareas } = props;
  const navigate = useNavigate();

  const irAlDetalle = (tarea: Tarea) => {
    navigate(`/tareas?id=${tarea.id}`);
  };

  return (
    <div className="div-estado">
        <div
          className={`row g-0 d-flex justify-content-between linea-estado ${estadoClase} link-estados`}
          onClick={() => navigate("/tareas")}
        >
          <div className="col-auto">
            <h4>{estado}</h4>
          </div>
          <div className="col-auto">›</div>
        </div>
      <div className="d-flex overflow-auto colores-claros">
        {tareas.length != 0 ? (
          tareas.map((tarea) => (
            <div
              key={tarea.id}
              onClick={() => irAlDetalle(tarea)}
              className={`tarjeta-tarea ${estadoClase}`}
            >
              <h5 className="textos mb-0">{tarea.nombre}</h5>
              <span className="badge-prioridad">{tarea.prioridad}</span>
              <p className="textos mb-0">{tarea.descripcion}</p>
              <p className="mas-info">Click para más info</p>
            </div>
          ))
        ) : (
          <div className="sin-tareas">
            <h5>No hay tareas en este estado.</h5>
          </div>
        )}
        {}
      </div>
    </div>
  );
}

export default EstadoTareas;
