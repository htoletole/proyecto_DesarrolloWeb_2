import "../styles/tareas.css";

// esqueleto ("bones") con la misma forma del tablero de tareas, se ve mientras cargan
function EsqueletoTareas() {
  const filas = [1, 2, 3];
  const tarjetas = [1, 2, 3];

  return (
    <div className="kanban-board" aria-busy="true" aria-label="Cargando tareas">
      {filas.map((fila) => (
        <div key={fila} className="kanban-row">
          <div className="esqueleto esqueleto-header" />
          <div className="kanban-cards-container">
            {tarjetas.map((tarjeta) => (
              <div key={tarjeta} className="esqueleto-tarjeta">
                <div className="esqueleto esqueleto-linea" />
                <div className="esqueleto esqueleto-linea corta" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EsqueletoTareas;
