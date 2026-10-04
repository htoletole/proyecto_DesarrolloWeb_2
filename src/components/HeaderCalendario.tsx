import profilePicture from "../assets/images/usuario.png";
import { fechaEncabezado } from "../services/fechas";
import "../styles/dashboard.css";

interface HeaderCalendarioProps {
  hoy: string;
}

// mismo encabezado del inicio (usa sus clases), solo cambia el texto
function HeaderCalendario(props: HeaderCalendarioProps) {
  const { hoy } = props;

  return (
    <div className="">
      <div className="container-fluid header-dashboard">
        <div className="row g-0">
          <div className="col-8 p-0">
            <h1>Calendario</h1>
            <p>Hoy es {fechaEncabezado(hoy)}</p>
          </div>
          <div className="col-4 p-0 d-flex align-items-center justify-content-end">
            <img src={profilePicture} alt="Profile picture" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderCalendario;
