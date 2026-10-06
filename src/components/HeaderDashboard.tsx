import profilePicture from "../assets/images/usuario.png";
import { ejecutarCerrarSesion } from "../services/authEvents";

interface HeaderProps {
  username: string;
}

function HeaderDashboard(props: HeaderProps) {
  const { username } = props;

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
            ¡Hola, <span className="username">{username}</span>!
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
