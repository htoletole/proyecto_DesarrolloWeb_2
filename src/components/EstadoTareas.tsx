import { Link } from "react-router-dom";
import type { Tarea } from "../pages/Tareas";
import type { MouseEvent } from "react";

interface EstadoProps {
  estadoClase: string;
  estado: string;
  tareas: Tarea[];
}

function EstadoTareas(props: EstadoProps) {
  const { estadoClase, estado, tareas } = props;

  const handleClick = (e: MouseEvent) => {
    console.log(e);
  };

  return (
    <div className="div-estado">
      <Link to={"/tareas"} className="link-estados">
        <div
          className={`row g-0 d-flex justify-content-between linea-estado ${estadoClase}`}
        >
          <div className="col-auto">
            <h4>{estado}</h4>
          </div>
          <div className="col-auto">›</div>
        </div>
      </Link>
      <div className="d-flex overflow-auto colores-claros">
        {tareas.length != 0 ? (
          tareas.map((tarea) => (
            <button
              onClick={handleClick}
              className={`tarjeta-tarea ${estadoClase}`}
            >
              <h5 className="textos mb-0">{tarea.nombre}</h5>
              <span className="badge-prioridad">{tarea.prioridad}</span>
              <p className="textos mb-0">{tarea.descripcion}</p>
              <p className="mas-info">Click para más info</p>
            </button>
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
