import { useEffect, useState } from "react";
import HeaderCalendario from "../components/HeaderCalendario";
import CalendarioMes from "../components/CalendarioMes";
import TareasDelDia from "../components/TareasDelDia";
import DetalleTarea from "../components/DetalleTarea";
import Formulario from "../components/Formulario";
import { armarFecha, fechaDeHoy, fechaLarga } from "../services/fechas";
import { obtenerFeriados } from "../services/publicApi";
import type { Feriado } from "../services/publicApi";
import { cargarTareas, guardarTareas } from "../services/tareasCalendario";
import type { Tarea } from "../services/tareasCalendario";
import "../styles/calendario.css";

function Calendario() {
  const hoy = fechaDeHoy();

  const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
  const [mes, setMes] = useState(Number(hoy.slice(5, 7)) - 1);
  const [seleccionado, setSeleccionado] = useState(hoy);

  const [tareas, setTareas] = useState<Tarea[]>(cargarTareas);
  const [tareaAbierta, setTareaAbierta] = useState<Tarea | null>(null);
  const [editando, setEditando] = useState(false);

  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [estadoFeriados, setEstadoFeriados] = useState("cargando");

  // pide los feriados cada vez que cambia el año
  useEffect(() => {
    obtenerFeriados(anio)
      .then((lista) => {
        setFeriados(lista);
        setEstadoFeriados("listo");
      })
      .catch(() => {
        setFeriados([]);
        setEstadoFeriados("error");
      });
  }, [anio]);

  function cambiarMes(nuevoMes: number) {
    setMes(nuevoMes);
    setSeleccionado(armarFecha(anio, nuevoMes, 1));
  }

  function cambiarAnio(nuevoAnio: number) {
    setAnio(nuevoAnio);
    setEstadoFeriados("cargando");
    setSeleccionado(armarFecha(nuevoAnio, mes, 1));
  }

  // tareas del dia elegido, y las que todavia no tienen fecha
  const tareasDelDia: Tarea[] = [];
  const tareasSinFecha: Tarea[] = [];
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].fecha === seleccionado) {
      tareasDelDia.push(tareas[i]);
    } else if (!tareas[i].fecha) {
      tareasSinFecha.push(tareas[i]);
    }
  }

  let feriadoDelDia: string | null = null;
  for (let i = 0; i < feriados.length; i++) {
    if (feriados[i].fecha === seleccionado) {
      feriadoDelDia = feriados[i].nombre;
    }
  }

  // asignaturas que se pueden elegir al editar, sin repetir
  const asignaturas: string[] = [];
  for (let i = 0; i < tareas.length; i++) {
    if (!asignaturas.includes(tareas[i].asignatura)) {
      asignaturas.push(tareas[i].asignatura);
    }
  }

  // el formulario no tiene fecha, asi que la fecha de la tarea no cambia
  function guardarEdicion(datos: Record<string, FormDataEntryValue>) {
    if (tareaAbierta === null) {
      return;
    }

    const editada: Tarea = {
      id: tareaAbierta.id,
      nombre: String(datos.nombre),
      descripcion: String(datos.descripcion),
      asignatura: String(datos.asignatura),
      estado: String(datos.estado),
      prioridad: String(datos.prioridad),
      horaEntrega: String(datos.horaEntrega),
      fecha: tareaAbierta.fecha,
    };

    const nuevas: Tarea[] = [];
    for (let i = 0; i < tareas.length; i++) {
      if (tareas[i].id === editada.id) {
        nuevas.push(editada);
      } else {
        nuevas.push(tareas[i]);
      }
    }

    guardarTareas(nuevas);
    setTareas(nuevas);
    setTareaAbierta(editada);
    setEditando(false);
  }

  // mensaje segun como va la consulta de feriados
  let mensaje = "";
  if (estadoFeriados === "cargando") {
    mensaje = "Cargando feriados...";
  } else if (estadoFeriados === "listo") {
    mensaje = "Feriados: Nager.Date (date.nager.at)";
  } else {
    mensaje = "No se pudieron cargar los feriados. Revisa tu conexión.";
  }

  return (
    <div className="pagina-calendario">
      <HeaderCalendario hoy={hoy} />

      <main className="cal-contenido">
        <CalendarioMes
          anio={anio}
          mes={mes}
          hoy={hoy}
          seleccionado={seleccionado}
          tareas={tareas}
          feriados={feriados}
          onCambioMes={cambiarMes}
          onCambioAnio={cambiarAnio}
          onSeleccionar={setSeleccionado}
        />

        <p className="cal-mensaje">{mensaje}</p>

        <TareasDelDia
          titulo={fechaLarga(seleccionado)}
          tareas={tareasDelDia}
          feriado={feriadoDelDia}
          mensajeVacio="Sin tareas"
          onElegir={setTareaAbierta}
        />

        {tareasSinFecha.length > 0 && (
          <TareasDelDia
            titulo="Tareas sin fecha"
            tareas={tareasSinFecha}
            feriado={null}
            mensajeVacio=""
            onElegir={setTareaAbierta}
          />
        )}
      </main>

      {tareaAbierta !== null && !editando && (
        <DetalleTarea tarea={tareaAbierta} onCerrar={() => setTareaAbierta(null)} onEditar={() => setEditando(true)} />
      )}

      {tareaAbierta !== null && (
        <Formulario
          abierto={editando}
          tipo="tarea"
          modo="editar"
          onCerrar={() => setEditando(false)}
          onAceptar={guardarEdicion}
          opcionesAsignatura={asignaturas}
          valoresIniciales={{
            nombre: tareaAbierta.nombre,
            descripcion: tareaAbierta.descripcion,
            asignatura: tareaAbierta.asignatura,
            estado: tareaAbierta.estado,
            prioridad: tareaAbierta.prioridad,
            horaEntrega: tareaAbierta.horaEntrega,
          }}
        />
      )}
    </div>
  );
}

export default Calendario;
