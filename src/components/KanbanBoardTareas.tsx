import React from 'react';
import iconoReloj from '../assets/icons/reloj.png';
import iconoGrafico from '../assets/icons/grafico.png';
import iconoCheck from '../assets/icons/check.png';

const KanbanBoard = () => {
  const columnas = [
    { id: 'pendiente', titulo: 'Pendiente', icono: iconoReloj },
    { id: 'progreso', titulo: 'En progreso', icono: iconoGrafico },
    { id: 'completado', titulo: 'Completado', icono: iconoCheck }
  ];

  const tareasDePrueba = [1, 2, 3, 4];

  return (
    <div className="kanban-board">
      {columnas.map((col) => (
        <div key={col.id} className="kanban-row">
          <div className="kanban-header">
            <h3>{col.titulo}</h3>
            <img src={col.icono} alt={col.titulo} className="kanban-icon-img" />
          </div>
          <div className="kanban-cards-container">
            {tareasDePrueba.map((tarea) => (
              <div key={tarea} className="task-card-placeholder"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;