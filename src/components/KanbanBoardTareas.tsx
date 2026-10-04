import iconoReloj from '../assets/icons/reloj.png';
import iconoGrafico from '../assets/icons/grafico.png';
import iconoCheck from '../assets/icons/check.png';
import type { Tarea } from '../pages/Tareas';

//plantilla visual de la tarjeta
const TarjetaTarea = ({ tarea }: { tarea: Tarea }) => (
  <div className="tarjeta-tarea">
    <h4 className="tarjeta-tarea-titulo">{tarea.nombre}</h4>
    <span className="tarjeta-tarea-subtitulo">{tarea.asignatura}</span>
  </div>
);

const KanbanBoardTareas = ({ tareas = [] }: { tareas?: Tarea[] }) => {
  const columnas = [
    { id: 'Pendiente', titulo: 'Pendiente', icono: iconoReloj },
    { id: 'En progreso', titulo: 'En progreso', icono: iconoGrafico },
    { id: 'Completada', titulo: 'Completado', icono: iconoCheck }
  ];

  return (
    <div className="kanban-board">
      {columnas.map((col) => {
        const tareasColumna = tareas.filter(t => t.estado === col.id);
        return (
          <div key={col.id} className="kanban-row">
            <div className="kanban-header">
              <h3>{col.titulo}</h3>
              <img src={col.icono} alt={col.titulo} className="kanban-icon-img" />
            </div>
            <div className="kanban-cards-container">
              {tareasColumna.length > 0 ? (
                tareasColumna.map(tarea => <TarjetaTarea key={tarea.id} tarea={tarea} />)
              ) : (
                <div className="task-card-placeholder"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoardTareas;