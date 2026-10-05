import iconoCalendario from '../assets/icons/calendario.png';
import iconoCheck from '../assets/icons/check.png';
import type { Tarea } from '../pages/Tareas';

const TarjetaTarea = ({ tarea, modoEdicion, seleccionada, onToggle }: { tarea: Tarea, modoEdicion: boolean, seleccionada: boolean, onToggle: (id: string) => void }) => (
  <div 
    className={`tarjeta-tarea ${seleccionada ? 'seleccionada' : ''} ${modoEdicion ? 'modo-edicion' : ''}`}
    onClick={() => modoEdicion && onToggle(tarea.id)}
  >
    <h4 className="tarjeta-tarea-titulo">{tarea.nombre}</h4>
    <span className="tarjeta-tarea-subtitulo">{tarea.asignatura}</span>
    {seleccionada && <img src={iconoCheck} alt="Seleccionada" className="icono-check-seleccion" />}
  </div>
);

interface KanbanProps {
  tareas?: Tarea[];
  modoEdicion?: boolean;
  tareasSeleccionadas?: string[];
  onToggleSeleccion?: (id: string) => void;
}

const KanbanBoardTareasFiltroDia = ({ tareas = [], modoEdicion = false, tareasSeleccionadas = [], onToggleSeleccion = () => {} }: KanbanProps) => {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  return (
    <div className="kanban-board">
      {dias.map((dia) => {
        const tareasColumna = tareas.filter(t => t.dia === dia);
        return (
          <div key={dia} className="kanban-row">
            <div className="kanban-header">
              <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
              <h3>{dia}</h3>
            </div>
            <div className="kanban-cards-container">
              {tareasColumna.length > 0 ? (
                tareasColumna.map(tarea => (
                  <TarjetaTarea key={tarea.id} tarea={tarea} modoEdicion={modoEdicion} seleccionada={tareasSeleccionadas.includes(tarea.id)} onToggle={onToggleSeleccion} />
                ))
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

export default KanbanBoardTareasFiltroDia;