import ProgressBar from "./ProgressBar";

interface PanelProps {
  pendientes: number;
  enProgreso: number;
  completadas: number;
}

function WeeklyProgressPanel(props: PanelProps) {
  const { pendientes, enProgreso, completadas } = props;

  const tareasIncompletas = pendientes + enProgreso;
  const totalTareas = pendientes + enProgreso + completadas;
  let porcentajeCompletadas, porcentajeIncompletas;
  if (totalTareas != 0) {
    porcentajeCompletadas = Math.round((completadas / totalTareas) * 100);
    porcentajeIncompletas = Math.round((tareasIncompletas / totalTareas) * 100);
  } else {
    porcentajeCompletadas = 0;
    porcentajeIncompletas = 0;
  }

  return (
    <div className="d-flex flex-column align-items-center panel-progreso-semanal">
      <h3>Progreso global</h3>
      {tareasIncompletas == 0 ? (
        <>
          <p>Hay 0 tareas incompletas</p>
          <p>¡No hay nada que hacer!</p>
        </>
      ) : tareasIncompletas == 1 ? (
        <>
          <p>Queda solo 1 tarea por hacer</p>
          <p>¡Bien hecho!</p>
        </>
      ) : tareasIncompletas > 1 && tareasIncompletas <= 5 ? (
        <>
          <p>Quedan solo {tareasIncompletas} tareas por hacer</p>
          <p>¡Tú puedes!</p>
        </>
      ) : (
        <>
          <p>Hay {tareasIncompletas} tareas incompletas</p>
          <p>¡Ánimo!</p>
        </>
      )}
      <div className="row">
        <div className="col-6 p-0 d-flex flex-column align-items-center">
          <ProgressBar porcentaje={porcentajeCompletadas} color="#4DEEB5" />
          <p className="tareas">Tareas completadas</p>
        </div>
        <div className="col-6 p-0 d-flex flex-column align-items-center">
          <ProgressBar porcentaje={porcentajeIncompletas} color="#65B5FD" />
          <p className="tareas incompletas">Tareas incompletas</p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressPanel;
