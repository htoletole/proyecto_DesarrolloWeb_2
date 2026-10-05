import { armarFecha, DIAS_SEMANA, MESES } from "../services/fechas";
import { buscarFeriado } from "../services/publicApi";
import type { Feriado } from "../services/publicApi";
import { filtrarPorFecha } from "../services/tareasCalendario";
import type { Tarea } from "../services/tareasCalendario";

interface CalendarioMesProps {
  anio: number;
  mes: number; // de 0 a 11
  hoy: string;
  seleccionado: string;
  tareas: Tarea[];
  feriados: Feriado[];
  onCambioMes: (mes: number) => void;
  onCambioAnio: (anio: number) => void;
  onSeleccionar: (fecha: string) => void;
}

function claseDelDia(esHoy: boolean, estaElegido: boolean, esFeriado: boolean, tieneTareas: boolean): string {
  let clase = "cal-dia";

  if (esHoy) {
    clase += " cal-dia-hoy";
  }
  if (estaElegido) {
    clase += " cal-dia-seleccionado";
  }
  if (esFeriado) {
    clase += " cal-dia-feriado";
  }
  if (tieneTareas) {
    clase += " cal-dia-con-tarea";
  }

  return clase;
}

function CalendarioMes(props: CalendarioMesProps) {
  const { anio, mes, hoy, seleccionado, tareas, feriados } = props;
  const { onCambioMes, onCambioAnio, onSeleccionar } = props;

  // los dias vacios del comienzo del mes se guardan como 0
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: number[] = [];

  for (let i = 0; i < primerDia; i++) {
    celdas.push(0);
  }
  for (let dia = 1; dia <= diasDelMes; dia++) {
    celdas.push(dia);
  }

  const anioDeHoy = Number(hoy.slice(0, 4));
  const anios: number[] = [];
  for (let a = anioDeHoy - 1; a <= anioDeHoy + 2; a++) {
    anios.push(a);
  }

  return (
    <section className="cal-tarjeta">
      <div className="cal-selectores">
        <select value={mes} onChange={(e) => onCambioMes(Number(e.target.value))} aria-label="Mes">
          {MESES.map((nombre, indice) => (
            <option key={nombre} value={indice}>
              {nombre.slice(0, 3)}
            </option>
          ))}
        </select>

        <select value={anio} onChange={(e) => onCambioAnio(Number(e.target.value))} aria-label="Año">
          {anios.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="cal-cuadricula">
        {DIAS_SEMANA.map((nombre) => (
          <span key={nombre} className="cal-nombre-dia">
            {nombre}
          </span>
        ))}

        {celdas.map((dia, indice) => {
          if (dia === 0) {
            return <span key={"vacio-" + indice} />;
          }

          const fecha = armarFecha(anio, mes, dia);
          const esFeriado = buscarFeriado(feriados, fecha) !== null;
          const tieneTareas = filtrarPorFecha(tareas, fecha).length > 0;
          const clase = claseDelDia(fecha === hoy, fecha === seleccionado, esFeriado, tieneTareas);

          return (
            <button key={fecha} type="button" className={clase} onClick={() => onSeleccionar(fecha)}>
              {dia}
            </button>
          );
        })}
      </div>

      <div className="cal-leyenda">
        <span className="cal-punto-tarea">Tarea</span>
        <span className="cal-punto-feriado">Feriado</span>
      </div>
    </section>
  );
}

export default CalendarioMes;
