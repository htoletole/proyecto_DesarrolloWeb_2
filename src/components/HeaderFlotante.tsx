import profilePicture from "../assets/images/usuario.png";
import { Link } from "react-router-dom";
import { ejecutarCerrarSesion } from "../services/authEvents";

interface HeaderProps {
  username?: string;
  titulo: string;
}

function HeaderDashboard(props: HeaderProps) {
  const { username, titulo } = props;

  const fecha = new Date();

  const fechaString = fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="sticky-top container-fluid header-dashboard">
      <div className="row g-0">
        <div className="col-8 p-0">
          <h1>
            {titulo}
            {username && <><span className="username">{username}</span>!</>}
          </h1>
          <p>Hoy es {fechaString}</p>
        </div>
        <div className="col-4 p-0 d-flex align-items-center justify-content-end">
          <div className="dropdown">
            <button
              className="btn dropdown-toggle rounded-circle perfil-user"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src={profilePicture} alt="Profile picture" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end p-0">
              <li>
                <Link className="dropdown-item boton-cerrar-sesion" to="/periodos">
                  Períodos académicos
                </Link>
              </li>
              <li>
                <Link className="dropdown-item boton-cerrar-sesion" to="/historial">
                  Historial de actividad
                </Link>
              </li>
              <li>
                <a
                  className="dropdown-item boton-cerrar-sesion"
                  onClick={ejecutarCerrarSesion}
                >
                  Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderDashboard;
