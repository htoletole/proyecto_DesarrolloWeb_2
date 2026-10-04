import iconoCalendario from '../assets/icons/calendario.png';

const KanbanBoardFiltroDia = () => {
  return (
    <div className="kanban-board">
      
      {/* Fila Lunes */}
      <div className="kanban-row">
        <div className="kanban-header">
          <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
          <h3>Lunes</h3>
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Martes */}
      <div className="kanban-row">
        <div className="kanban-header">
          <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
          <h3>Martes</h3>
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Miercoles */}
      <div className="kanban-row">
        <div className="kanban-header">
          <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
          <h3>Miercoles</h3>
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Jueves */}
      <div className="kanban-row">
        <div className="kanban-header">
          <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
          <h3>Jueves</h3>
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Viernes */}
      <div className="kanban-row">
        <div className="kanban-header">
          <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
          <h3>Viernes</h3>
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

    </div>
  );
};

export default KanbanBoardFiltroDia;