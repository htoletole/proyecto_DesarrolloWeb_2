import HeaderTareas from '../components/HeaderTareas';
import Navbar from '../components/Navbar';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareas';
import iconoInfo from '../assets/icons/info.png';
import iconoMas from '../assets/icons/mas.png';
import iconoFiltro from '../assets/icons/filtro.png';
import '../styles/styles.css';

function Tareas() {
  return (
    <div className="min-vh-100 w-100 p-2 page-container">
      
      <HeaderTareas />
      
      <main className="content-container">
        
        <SearchBarTareas />

  
        <div className="info-banner">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona una tarea para ver mas informacion sobre esta.</p>
        </div>


        <div className="action-buttons-container">
          <button className="btn-crear">
            Crear Tarea <img src={iconoMas} alt="Crear" className="btn-icon" />
          </button>
          <button className="btn-filtrar">
            Filtrar <img src={iconoFiltro} alt="Filtrar" className="btn-icon" />
          </button>
        </div>


        <KanbanBoardTareas />

      </main>

      <Navbar />
    </div>
  );
}

export default Tareas;