import iconoUsuario from "../assets/images/usuario.png";
import "../styles/headergeneral.css";

interface HeaderProps {
  titulo: string
}

function HeaderGeneral({ titulo } : HeaderProps) {
  return (
    <header className="header-general">
      <h1>Panel de {titulo}</h1>
      <button
        className="btn p-0 rounded-circle bg-dark d-flex align-items-center justify-content-center"
        style={{
          width: "45px",
          height: "45px",
          overflow: "hidden",
          border: "none",
        }}
      >
        <img
          src={iconoUsuario}
          alt="Perfil de usuario"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      </button>
    </header>
  );
};

export default HeaderGeneral;
