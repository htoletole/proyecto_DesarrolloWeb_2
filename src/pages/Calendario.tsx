import { useEffect, useState } from "react";
import HeaderCalendario from "../components/HeaderCalendario";
import CalendarioMes from "../components/CalendarioMes";
import TareasDelDia from "../components/TareasDelDia";
import DetalleTarea from "../components/DetalleTarea";
import Formulario from "../components/Formulario";
import { armarFecha, fechaDeHoy, fechaLarga } from "../services/fechas";
import { buscarFeriado, obtenerFeriados } from "../services/publicApi";
import type { Feriado } from "../services/publicApi";
import {
  cargarTareas,
  filtrarPorFecha,
  filtrarSinFecha,
  guardarTareas,
  listarAsignaturas,
  reemplazarTarea,
} from "../services/tareasCalendario";
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

  // pide los feriados cada vez que cambia el anio
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

  // lo que se muestra del dia elegido
  const tareasDelDia = filtrarPorFecha(tareas, seleccionado);
  const tareasSinFecha = filtrarSinFecha(tareas);
  const feriadoDelDia = buscarFeriado(feriados, seleccionado);
  const asignaturas = listarAsignaturas(tareas);

  // guarda lo que se edito, incluida la fecha
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
      fecha: String(datos.fecha),
    };

    const nuevas = reemplazarTarea(tareas, editada);

    guardarTareas(nuevas);
    setTareas(nuevas);
    setTareaAbierta(editada);
    setEditando(false);

    // si cambio de dia, el calendario se mueve a esa fecha
    if (editada.fecha) {
      setAnio(Number(editada.fecha.slice(0, 4)));
      setMes(Number(editada.fecha.slice(5, 7)) - 1);
      setSeleccionado(editada.fecha);
    }
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
            fecha: tareaAbierta.fecha ? tareaAbierta.fecha : "",
          }}
        />
      )}
    </div>
  );
}

export default Calendario;
