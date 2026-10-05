import iconoCalendario from '../assets/icons/calendario.png';
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

const obtenerDiaSemana = (fechaString?: string) => {
  if (!fechaString) return 'Sin fecha';
  const partes = fechaString.split('-');
  if (partes.length !== 3) return 'Sin fecha';
  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return diasSemana[fecha.getDay()];
};

const KanbanBoardTareasFiltroDia = ({ 
  tareas = [], modoEdicion = false, tareasSeleccionadas = [], onToggleSeleccion = () => {}, onVerDetalle 
}: KanbanProps) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Sin fecha'];

  return (
    <div className="kanban-board">
      {dias.map((dia) => {
        const tareasColumna = tareas.filter(t => obtenerDiaSemana(t.fecha) === dia);
        if (dia === 'Sin fecha' && tareasColumna.length === 0) return null;

        return (
          <div key={dia} className="kanban-row">
            <div className="kanban-header">
              <img src={iconoCalendario} alt="Calendario" className="kanban-icon-img" />
              <h3>{dia}</h3>
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

export default KanbanBoardTareasFiltroDia;