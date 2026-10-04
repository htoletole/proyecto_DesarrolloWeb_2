import { Link } from "react-router-dom";

interface Tarea {
  nombre: string;
  estado: string;
  descripcion: string;
}

interface EstadoProps {
  estadoClase: string;
  estado: string;
  tareas: Tarea[];
}

function EstadoTareas(props: EstadoProps) {
  const { estadoClase, estado, tareas } = props;

  return (
    <div className="div-estado">
      <Link to={"/tareas"} className="link-tareas">
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
            <div className={`tarjeta-tarea ${estadoClase}`}>
              <h5 className="textos">{tarea.nombre}</h5>
              <p className="textos">{tarea.descripcion}</p>
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
