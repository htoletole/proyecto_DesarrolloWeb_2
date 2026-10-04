// src/pages/Tareas.tsx
import { useState } from 'react';
import HeaderTareas from '../components/HeaderTareas';
import Navbar from '../components/Navbar';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareas';
import KanbanBoardTareasFiltro from '../components/KanbanBoardTareasFiltro';
import KanbanBoardTareasFiltroDia from '../components/KanbanBoardTareasFiltroDia';
import KanbarBoardTareasFiltroRamo from '../components/KanbanBoardTareasFiltroRamo';
import iconoInfo from '../assets/icons/info.png';
import iconoMas from '../assets/icons/mas.png';
import iconoFiltro from '../assets/icons/filtro.png';
import '../styles/tareas.css';

function Tareas() {
  const [tipoFiltro, setTipoFiltro] = useState('normal');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const aplicarFiltro = (filtro: string) => {
    setTipoFiltro(filtro);
    setMenuAbierto(false);
  };

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
          
          <div style={{ position: 'relative' }}>
            <button 
              className="btn-filtrar" 
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              Filtrar <img src={iconoFiltro} alt="Filtrar" className="btn-icon" />
            </button>

            {/*menu que aparece solo cuando menuabierto es true */}
            {menuAbierto && (
              <div className="filtro-dropdown">
                <button onClick={() => aplicarFiltro('normal')}>Por Estado</button>
                <button onClick={() => aplicarFiltro('prioridad')}>Por Prioridad</button>
                <button onClick={() => aplicarFiltro('dia')}>Por Día</button>
                <button onClick={() => aplicarFiltro('ramo')}>Por Ramo</button>
              </div>
            )}
          </div>
        </div>

        {/* Renderizado de los tableros */}
        {tipoFiltro === 'normal' && <KanbanBoardTareas />}
        {tipoFiltro === 'prioridad' && <KanbanBoardTareasFiltro />}
        {tipoFiltro === 'dia' && <KanbanBoardTareasFiltroDia />}
        {tipoFiltro === 'ramo' && <KanbarBoardTareasFiltroRamo />}

      </main>

      <Navbar />
    </div>
  );
}



export default Tareas;