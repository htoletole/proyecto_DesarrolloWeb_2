import { useEffect, useState } from "react";
import HeaderFlotante from "../components/HeaderFlotante";
import CalendarioMes from "../components/CalendarioMes";
import TareasDelDia from "../components/TareasDelDia";
import DetalleTarea from "../components/DetalleTarea";
import Formulario from "../components/Formulario";
import EstadoCarga from "../components/EstadoCarga";
import { listarEvaluaciones } from "../services/evaluacionesApi";
import { armarFecha, fechaDeHoy, fechaLarga } from "../services/fechas";
import { buscarFeriado, obtenerFeriados } from "../services/publicApi";
import type { Feriado } from "../services/publicApi";
import { listarRamos } from "../services/ramosApi";
import { datosDesdeFormulario, editarTarea, listarTareas } from "../services/tareasApi";
import { evaluacionesDelDia, filtrarPorFecha, filtrarSinFecha, TAREA_VACIA } from "../services/tareasCalendario";
import type { Evaluacion, Ramo, Tarea } from "../services/tipos";
import { useSesion } from "../services/useSesion";
import "../styles/calendario.css";

function Calendario() {
  const sesion = useSesion();
  const hoy = fechaDeHoy();

  const [anio, setAnio] = useState(Number(hoy.slice(0, 4)));
  const [mes, setMes] = useState(Number(hoy.slice(5, 7)) - 1);
  const [seleccionado, setSeleccionado] = useState(hoy);

  // tareas, evaluaciones y ramos vienen de nuestra API
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tareaAbierta, setTareaAbierta] = useState<Tarea>(TAREA_VACIA);
  const [editando, setEditando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [enviando, setEnviando] = useState(false);

  // los feriados vienen de la API publica Nager.Date
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [estadoFeriados, setEstadoFeriados] = useState("cargando");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const [listaTareas, listaEvaluaciones, listaRamos] = await Promise.all([
        listarTareas(),
        listarEvaluaciones(),
        listarRamos(),
      ]);
      setTareas(listaTareas);
      setEvaluaciones(listaEvaluaciones);
      setRamos(listaRamos);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  // se carga al entrar y cada vez que cambia el usuario
  useEffect(() => {
    if (sesion) {
      cargar();
    }
  }, [sesion?.id]);

  // pide los feriados cuando cambia el año
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

  const tareasDelDia = filtrarPorFecha(tareas, seleccionado);
  const evaluacionesDelSeleccionado = evaluacionesDelDia(evaluaciones, seleccionado);
  const tareasSinFecha = filtrarSinFecha(tareas);
  const feriadoDelDia = buscarFeriado(feriados, seleccionado);

  // guarda la edicion en la API y mueve el calendario a la nueva fecha
  async function guardarEdicion(datos: Record<string, FormDataEntryValue>) {
    if (tareaAbierta.id === 0) {
      return;
    }

    setEnviando(true);
    setErrorFormulario("");
    try {
      const editada = await editarTarea(tareaAbierta.id, datosDesdeFormulario(datos));
      setTareas(tareas.map((tarea) => (tarea.id === editada.id ? editada : tarea)));
      setTareaAbierta(editada);
      setEditando(false);

      // si cambio de dia, el calendario se mueve a esa fecha
      if (editada.fecha) {
        setAnio(Number(editada.fecha.slice(0, 4)));
        setMes(Number(editada.fecha.slice(5, 7)) - 1);
        setSeleccionado(editada.fecha);
      }
    } catch (e) {
      setErrorFormulario((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

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
      <HeaderFlotante titulo="Calendario" />

      <main className="cal-contenido">
        <CalendarioMes
          anio={anio}
          mes={mes}
          hoy={hoy}
          seleccionado={seleccionado}
          tareas={tareas}
          evaluaciones={evaluaciones}
          feriados={feriados}
          onCambioMes={cambiarMes}
          onCambioAnio={cambiarAnio}
          onSeleccionar={setSeleccionado}
        />

        <p className="cal-mensaje">{mensaje}</p>

        <EstadoCarga cargando={cargando} error={error} onReintentar={cargar} />

        {!cargando && error === "" && (
          <>
            <TareasDelDia
              titulo={fechaLarga(seleccionado)}
              tareas={tareasDelDia}
              evaluaciones={evaluacionesDelSeleccionado}
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
          </>
        )}
      </main>

      {tareaAbierta.id !== 0 && !editando && (
        <DetalleTarea
          tarea={tareaAbierta}
          onCerrar={() => setTareaAbierta(TAREA_VACIA)}
          onEditar={() => {
            setErrorFormulario("");
            setEditando(true);
          }}
        />
      )}

      {tareaAbierta.id !== 0 && (
        <Formulario
          abierto={editando}
          tipo="tarea"
          modo="editar"
          onCerrar={() => setEditando(false)}
          onAceptar={guardarEdicion}
          opcionesAsignatura={ramos.map((ramo) => ({ valor: String(ramo.id), texto: ramo.nombre }))}
          error={errorFormulario}
          enviando={enviando}
          valoresIniciales={{
            nombre: tareaAbierta.nombre,
            descripcion: tareaAbierta.descripcion,
            asignaturaId: String(tareaAbierta.asignaturaId),
            estado: tareaAbierta.estado,
            prioridad: tareaAbierta.prioridad,
            horaEntrega: tareaAbierta.horaEntrega ?? "",
            fecha: tareaAbierta.fecha ?? "",
          }}
        />
      )}
    </div>
  );
}

export default Calendario;
