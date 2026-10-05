import iconoBaja from '../assets/icons/baja.png';
import iconoNormal from '../assets/icons/normal.png';
import iconoAlta from '../assets/icons/alta.png';
import iconoUrgente from '../assets/icons/urgente.png';
import iconoCheck from '../assets/icons/check.png';
import type { Tarea } from '../pages/Tareas';

const TarjetaTarea = ({ 
  tarea, modoEdicion, seleccionada, onToggle, onVerDetalle 
}: { 
  tarea: Tarea, modoEdicion: boolean, seleccionada: boolean, onToggle: (id: string) => void, onVerDetalle?: (tarea: Tarea) => void 
}) => (
  <div 
    className={`tarjeta-tarea ${seleccionada ? 'seleccionada' : ''} ${modoEdicion ? 'modo-edicion' : ''}`}
    onClick={() => {
      if (modoEdicion) {
        onToggle(tarea.id);
      } else if (onVerDetalle) {
        onVerDetalle(tarea);
      }
    }}
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
  onVerDetalle?: (tarea: Tarea) => void;
}

const KanbanBoardTareasFiltro = ({ 
  tareas = [], modoEdicion = false, tareasSeleccionadas = [], onToggleSeleccion = () => {}, onVerDetalle 
}: KanbanProps) => {
  const columnas = [
    { id: 'Baja', titulo: 'Baja', icono: iconoBaja },
    { id: 'Media', titulo: 'Normal', icono: iconoNormal },
    { id: 'Alta', titulo: 'Alta', icono: iconoAlta },
    { id: 'Urgente', titulo: 'Urgente', icono: iconoUrgente }
  ];

  return (
    <div className="kanban-board">
      {columnas.map((col) => {
        const tareasColumna = tareas.filter(t => t.prioridad === col.id);
        return (
          <div key={col.id} className="kanban-row">
            <div className="kanban-header">
              <h3>{col.titulo}</h3>
              <img src={col.icono} alt={col.titulo} className="kanban-icon-img" style={{ marginLeft: '8px' }} />
            </div>
            <div className="kanban-cards-container">
              {tareasColumna.length > 0 ? (
                tareasColumna.map(tarea => (
                  <TarjetaTarea 
                    key={tarea.id} 
                    tarea={tarea} 
                    modoEdicion={modoEdicion} 
                    seleccionada={tareasSeleccionadas.includes(tarea.id)} 
                    onToggle={onToggleSeleccion} 
                    onVerDetalle={onVerDetalle} 
                  />
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

export default KanbanBoardTareasFiltro;