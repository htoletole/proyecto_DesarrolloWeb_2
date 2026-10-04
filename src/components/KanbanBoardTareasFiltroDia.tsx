import iconoCalendario from '../assets/icons/calendario.png';
import type { Tarea } from '../pages/Tareas';

const KanbanBoardTareasFiltroDia = ({ tareas = [] }: { tareas?: Tarea[] }) => {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  return (
    <div className="kanban-board">
      {dias.map((dia) => (
        <div key={dia} className="kanban-row">
          <div className="kanban-header">
            <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
            <h3>{dia}</h3>
          </div>
          <div className="kanban-cards-container">
            <div className="task-card-placeholder"></div>
            <div className="task-card-placeholder"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoardTareasFiltroDia;