import iconoBaja from '../assets/icons/baja.png';
import iconoNormal from '../assets/icons/normal.png';
import iconoAlta from '../assets/icons/alta.png';
import iconoUrgente from '../assets/icons/urgente.png';

const KanbanBoardTareasFiltro = () => {
  return (
    <div className="kanban-board">
      
      {/* Fila Baja */}
      <div className="kanban-row">
        <div className="kanban-header">
          <h3>Baja</h3>
          <img src={iconoBaja} alt="Baja" className="kanban-icon-img" style={{ marginLeft: '8px' }} />
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Normal */}
      <div className="kanban-row">
        <div className="kanban-header">
          <h3>Normal</h3>
          <img src={iconoNormal} alt="Normal" className="kanban-icon-img" style={{ marginLeft: '8px' }} />
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Alta */}
      <div className="kanban-row">
        <div className="kanban-header">
          <h3>Alta</h3>
          <img src={iconoAlta} alt="Alta" className="kanban-icon-img" style={{ marginLeft: '8px' }} />
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila Urgente */}
      <div className="kanban-row">
        <div className="kanban-header">
          <h3>Urgente</h3>
          <img src={iconoUrgente} alt="Urgente" className="kanban-icon-img" style={{ marginLeft: '8px' }} />
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

export default KanbanBoardTareasFiltro;