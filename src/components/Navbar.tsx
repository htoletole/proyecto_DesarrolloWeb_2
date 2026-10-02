import "../styles/styles.css";
import homeIcon from "../assets/icons/casa.png";
import taskIcon from "../assets/icons/portapapeles.png";
import subjectIcon from "../assets/icons/birrete.png";
import calendarIcon from "../assets/icons/calendario.png";

const styles = {
  backgroundColor: "red",
};

function Navbar() {
  return (
    <nav className="fixed-bottom d-flex align-items-center navdiv">
      <div className="container">
        <ul className="nav nav-justified nav-underline">
          <li className="nav-item">
            <a
              className="nav-link active custom-nav-link"
              aria-current="page"
              href="#"
            >
              <img className="home-icon" src={homeIcon} alt="Logo" />
              <span>Inicio</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link custom-nav-link" href="#">
              <img src={taskIcon} alt="Logo" />
              <span>Tareas</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link custom-nav-link" href="#">
              <img className="subject-icon" src={subjectIcon} alt="Logo" />
              <span>Ramos</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link custom-nav-link" href="#">
              <img src={calendarIcon} alt="Logo" />
              <span>Calendario</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
