import { useEffect, useState } from "react";
import HeaderFixed from "../components/HeaderFixed";
import Formulario from "../components/Formulario";
import ModalConfirmacionTareas from "../components/ModalConfirmacionTareas";
import Toast from "../components/Toast";
import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import {
  crearEvaluacion,
  editarEvaluacion,
  eliminarEvaluacion,
  listarEvaluaciones,
  listarRamosSimples,
  TIPOS_EVALUACION,
} from "../services/evaluacionesApi";
import type { Evaluacion, RamoSimple } from "../services/evaluacionesApi";
import { fechaCorta, fechaDeHoy } from "../services/fechas";
import { useSesion } from "../services/useSesion";
import "../styles/tareas.css";
import "../styles/evaluaciones.css";

type ModoFormulario = "crear" | "editar";

// promedio de las notas que ya se tienen, segun su ponderacion
function promedioDelRamo(evaluaciones: Evaluacion[]): string {
  let suma = 0;
  let ponderacion = 0;
  for (const evaluacion of evaluaciones) {
    if (evaluacion.nota !== null) {
      suma += evaluacion.nota * evaluacion.ponderacion;
      ponderacion += evaluacion.ponderacion;
    }
  }
  if (ponderacion === 0) {
    return "-";
  }
  return (Math.round((suma / ponderacion) * 10) / 10).toFixed(1);
}

function Evaluaciones() {
  const sesion = useSesion();
  const hoy = fechaDeHoy();

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [ramos, setRamos] = useState<RamoSimple[]>([]);
  const [filtroRamo, setFiltroRamo] = useState("");

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>("crear");
  const [evaluacionAEditar, setEvaluacionAEditar] = useState<Evaluacion | null>(null);
  const [evaluacionAEliminar, setEvaluacionAEliminar] = useState<Evaluacion | null>(null);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tituloAlerta, setTituloAlerta] = useState("");

  // las evaluaciones y los ramos se piden a la API cuando hay una sesion iniciada
  useEffect(() => {
    if (!sesion) return;

    listarRamosSimples()
      .then((lista) => setRamos(lista))
      .catch((error) => console.error("Error al cargar ramos:", error));

    listarEvaluaciones()
      .then((lista) => setEvaluaciones(lista))
      .catch((error) => console.error("Error al cargar evaluaciones:", error));
  }, [sesion?.id]);

  const avisar = (titulo: string, mensaje: string) => {
    setTituloAlerta(titulo);
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
  };

  const abrirFormularioCrear = () => {
    if (ramos.length === 0) {
      alert("Primero crea un ramo en el panel de Ramos.");
      return;
    }
    setModoFormulario("crear");
    setEvaluacionAEditar(null);
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (evaluacion: Evaluacion) => {
    setModoFormulario("editar");
    setEvaluacionAEditar(evaluacion);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setEvaluacionAEditar(null);
  };

  const guardarEvaluacion = async (datos: Record<string, FormDataEntryValue>) => {
    const notaTexto = String(datos.nota ?? "").trim();
    const datosEvaluacion = {
      nombre: String(datos.nombre ?? "").trim(),
      tipo: String(datos.tipo ?? ""),
      fecha: String(datos.fecha ?? ""),
      ponderacion: Number(datos.ponderacion),
      nota: notaTexto === "" ? null : Number(notaTexto),
    };

    try {
      if (modoFormulario === "crear") {
        const ramo = ramos.find((r) => r.nombre === String(datos.asignatura));
        if (!ramo) {
          alert("Elige un ramo.");
          return;
        }
        const creada = await crearEvaluacion(ramo.id, datosEvaluacion);
        setEvaluaciones((actuales) => [...actuales, creada]);
        avisar("Evaluación creada", `¡Evaluación "${creada.nombre}" creada con éxito!`);
      } else if (evaluacionAEditar) {
        const editada = await editarEvaluacion(evaluacionAEditar.id, datosEvaluacion);
        setEvaluaciones((actuales) =>
          actuales.map((e) => (e.id === editada.id ? editada : e)),
        );
        avisar("Evaluación editada", `¡La evaluación "${editada.nombre}" se modificó con éxito!`);
      }
    } catch (error) {
      // por ejemplo, si la ponderacion del ramo pasa de 100%
      alert((error as Error).message);
      return;
    }

    cerrarFormulario();
  };

  const confirmarEliminacion = async () => {
    if (!evaluacionAEliminar) return;

    try {
      await eliminarEvaluacion(evaluacionAEliminar.id);
    } catch (error) {
      alert((error as Error).message);
      return;
    }

    setEvaluaciones((actuales) => actuales.filter((e) => e.id !== evaluacionAEliminar.id));
    avisar("Evaluación eliminada", `¡Se eliminó la evaluación "${evaluacionAEliminar.nombre}"!`);
    setEvaluacionAEliminar(null);
  };

  // se agrupan por ramo, y dentro de cada ramo van ordenadas por fecha
  const ramosAMostrar = ramos.filter((ramo) => filtroRamo === "" || ramo.nombre === filtroRamo);

  const valoresIniciales = evaluacionAEditar
    ? {
        nombre: evaluacionAEditar.nombre,
        asignatura: evaluacionAEditar.ramo,
        tipo: evaluacionAEditar.tipo,
        fecha: evaluacionAEditar.fecha,
        ponderacion: String(evaluacionAEditar.ponderacion),
        nota: evaluacionAEditar.nota !== null ? String(evaluacionAEditar.nota) : "",
      }
    : undefined;

  return (
    <div className="min-vh-100 w-100 page-container evaluaciones-page">
      <HeaderFixed titulo="Evaluaciones" />

      <main className="content-container">
        <div className="info-banner info-banner-evaluaciones">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona una evaluación para editarla. Las ponderaciones de un ramo suman hasta 100%.</p>
        </div>

        <div className="action-buttons-container">
          <button type="button" className="btn-crear btn-crear-evaluaciones" onClick={abrirFormularioCrear}>
            Crear Evaluación
            <img src={iconoMas} alt="Crear evaluación" className="btn-icon" />
          </button>

          <select
            className="evaluaciones-filtro"
            value={filtroRamo}
            onChange={(e) => setFiltroRamo(e.target.value)}
            aria-label="Filtrar por ramo"
          >
            <option value="">Todos los ramos</option>
            {ramos.map((ramo) => (
              <option key={ramo.id} value={ramo.nombre}>
                {ramo.nombre}
              </option>
            ))}
          </select>
        </div>

        {ramos.length === 0 && (
          <p className="evaluaciones-vacio">Todavía no tienes ramos. Crea uno en el panel de Ramos.</p>
        )}

        {ramosAMostrar.map((ramo) => {
          const delRamo = evaluaciones
            .filter((evaluacion) => evaluacion.ramoId === ramo.id)
            .sort((a, b) => a.fecha.localeCompare(b.fecha));

          let ponderacionUsada = 0;
          for (const evaluacion of delRamo) {
            ponderacionUsada += evaluacion.ponderacion;
          }

          return (
            <section key={ramo.id} className="evaluaciones-ramo">
              <div className="evaluaciones-ramo-header" style={{ backgroundColor: ramo.color }}>
                <h3>{ramo.nombre}</h3>
                <span>
                  Ponderación {ponderacionUsada}% · Promedio {promedioDelRamo(delRamo)}
                </span>
              </div>

              {delRamo.length === 0 ? (
                <p className="evaluaciones-vacio">Sin evaluaciones en este ramo.</p>
              ) : (
                <div className="evaluaciones-lista">
                  {delRamo.map((evaluacion) => (
                    <div
                      key={evaluacion.id}
                      className={`evaluacion-card ${evaluacion.fecha < hoy ? "pasada" : ""}`}
                      onClick={() => abrirFormularioEditar(evaluacion)}
                    >
                      <div className="evaluacion-card-info">
                        <h4>{evaluacion.nombre}</h4>
                        <p>
                          <span className="evaluacion-tipo">{TIPOS_EVALUACION[evaluacion.tipo] ?? evaluacion.tipo}</span>
                          {fechaCorta(evaluacion.fecha)} · {evaluacion.ponderacion}%
                        </p>
                      </div>

                      <div className="evaluacion-card-nota">
                        {evaluacion.nota !== null ? evaluacion.nota.toFixed(1) : "Sin nota"}
                      </div>

                      <button
                        type="button"
                        className="evaluacion-card-eliminar"
                        aria-label={`Eliminar ${evaluacion.nombre}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvaluacionAEliminar(evaluacion);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>

      <Formulario
        abierto={formularioAbierto}
        tipo="evaluacion"
        modo={modoFormulario}
        valoresIniciales={valoresIniciales}
        onCerrar={cerrarFormulario}
        onAceptar={guardarEvaluacion}
        opcionesAsignatura={ramos.map((ramo) => ramo.nombre)}
      />

      <ModalConfirmacionTareas
        abierto={evaluacionAEliminar !== null}
        mensaje="¿Desea confirmar la eliminación de la evaluación?"
        onConfirmar={confirmarEliminacion}
        onDenegar={() => setEvaluacionAEliminar(null)}
      />

      <Toast
        mostrar={mostrarAlerta}
        mensaje={mensajeAlerta}
        titulo={tituloAlerta}
        onClose={() => setMostrarAlerta(false)}
      />
    </div>
  );
}

export default Evaluaciones;
