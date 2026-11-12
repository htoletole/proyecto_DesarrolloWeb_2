import iconoUsuario from "../assets/images/usuario.png";
import "../styles/headergeneral.css";
import { Link } from "react-router-dom";
import { ejecutarCerrarSesion } from "../services/authEvents";

interface HeaderProps {
  titulo: string;
}

function HeaderGeneral({ titulo }: HeaderProps) {
  return (
    <header className="header-general">
      <h1>Panel de {titulo}</h1>
      <div className="dropdown">
        <button
          className="btn dropdown-toggle p-0 rounded-circle bg-dark d-flex align-items-center justify-content-center"
          style={{
            width: "45px",
            height: "45px",
            overflow: "hidden",
            border: "none",
          }}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={iconoUsuario}
            alt="Perfil de usuario"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
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
    </header>
  );
}

export default HeaderGeneral;
