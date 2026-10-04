
const KanbanBoardFiltroRamo = () => {
  return (
    <div className="kanban-board">
      
      {/* Fila 1 */}
      <div className="kanban-row">
        <div className="kanban-header" style={{ minWidth: '150px', height: '32px' }}>
          {/* Vacío según el diseño */}
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila 2 */}
      <div className="kanban-row">
        <div className="kanban-header" style={{ minWidth: '150px', height: '32px' }}>
          {/* Vacío según el diseño */}
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

      {/* Fila 3 */}
      <div className="kanban-row">
        <div className="kanban-header" style={{ minWidth: '150px', height: '32px' }}>
          {/* Vacío según el diseño */}
        </div>
        <div className="kanban-cards-container">
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
          <div className="task-card-placeholder"></div>
        </div>
      </div>

    </div>
  );
};

export default KanbanBoardFiltroRamo;