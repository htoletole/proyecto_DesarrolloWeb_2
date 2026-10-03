import ProgressBar from "./ProgressBar";

interface PanelProps {
  pendientes: number;
}

function WeeklyProgressPanel(props: PanelProps) {
  const { pendientes } = props;

  return (
    <div className="d-flex flex-column align-items-center panel-progreso-semanal">
      <h3>Progreso semanal</h3>
      <p>Quedan {pendientes} cosas pendientes</p>
      <p>¡Bien hecho!</p>
      <div className="row">
        <div className="col-6 p-0 d-flex flex-column align-items-center">
          <ProgressBar porcentaje={33} color="#4DEEB5" />
          <p className="tareas">Tareas completadas</p>
        </div>
        <div className="col-6 p-0 d-flex flex-column align-items-center">
          <ProgressBar porcentaje={67} color="#65B5FD" />
          <p className="tareas incompletas">Tareas incompletas</p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressPanel;
