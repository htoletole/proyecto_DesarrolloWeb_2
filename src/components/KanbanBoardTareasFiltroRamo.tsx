import type { Tarea } from '../pages/Tareas';

const TarjetaTarea = ({ tarea }: { tarea: Tarea }) => (
  <div className="tarjeta-tarea">
    <h4 className="tarjeta-tarea-titulo">{tarea.nombre}</h4>
    <span className="tarjeta-tarea-subtitulo">{tarea.estado}</span>
  </div>
);

const KanbarBoardTareasFiltroRamo = ({ tareas = [], ramos = [] }: { tareas?: Tarea[], ramos?: string[] }) => {
  return (
    <div className="kanban-board">
      {ramos.length === 0 && <p style={{color: '#666'}}>No hay ramos creados aún.</p>}
      
      {ramos.map((ramo) => {
        const tareasColumna = tareas.filter(t => t.asignatura === ramo);
        return (
          <div key={ramo} className="kanban-row">
            <div className="kanban-header" style={{ minWidth: '150px', height: '32px', padding: '0 15px', display: 'flex', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '16px' }}>{ramo}</h3>
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

export default KanbarBoardTareasFiltroRamo;