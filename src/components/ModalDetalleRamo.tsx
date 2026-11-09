import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import iconoLapiz from "../assets/icons/lapiz.png";
import EstadoCarga from "./EstadoCarga";
import Formulario from "./Formulario";
import { MODALIDADES, TIPOS_EVALUACION, claseEstado, fechaCortaTexto } from "../services/etiquetas";
import {
  crearEvaluacion,
  datosEvaluacionDesdeFormulario,
  editarEvaluacion,
  eliminarEvaluacion,
} from "../services/evaluacionesApi";
import { obtenerRamo } from "../services/ramosApi";
import type { Evaluacion, Ramo, RamoDetalle } from "../services/tipos";
import "../styles/ramos.css";

type ModalDetalleRamoProps = {
  abierto: boolean;
  ramo: Ramo | null;
  onCerrar: () => void;
  onEditar: (ramo: Ramo) => void;
  // avisa a la pagina que algo cambio (para actualizar los contadores)
  onCambio?: () => void;
};

const ModalDetalleRamo = ({ abierto, ramo, onCerrar, onEditar, onCambio }: ModalDetalleRamoProps) => {
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<RamoDetalle | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // formulario de evaluaciones (crear o editar)
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [evaluacionAEditar, setEvaluacionAEditar] = useState<Evaluacion | null>(null);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [enviando, setEnviando] = useState(false);

  // pide el detalle del ramo con sus evaluaciones, tareas y avance
  async function cargar(id: number) {
    setCargando(true);
    setError("");
    try {
      setDetalle(await obtenerRamo(id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  const idRamo = ramo ? ramo.id : 0;
  useEffect(() => {
    setDetalle(null);
    setFormularioAbierto(false);
    if (idRamo !== 0) {
      cargar(idRamo);
    }
  }, [idRamo]);

  if (!abierto || !ramo) return null;

  function abrirFormulario(evaluacion: Evaluacion | null) {
    setEvaluacionAEditar(evaluacion);
    setErrorFormulario("");
    setFormularioAbierto(true);
  }

  async function guardarEvaluacion(datos: Record<string, FormDataEntryValue>) {
    if (!ramo) return;
    const datosEvaluacion = datosEvaluacionDesdeFormulario(datos, ramo.id);

    setEnviando(true);
    setErrorFormulario("");
    try {
      if (evaluacionAEditar) {
        await editarEvaluacion(evaluacionAEditar.id, datosEvaluacion);
      } else {
        await crearEvaluacion(datosEvaluacion);
      }
      setFormularioAbierto(false);
      await cargar(ramo.id);
      onCambio?.();
    } catch (e) {
      // por ejemplo: las ponderaciones pasan de 100% o la fecha esta fuera del periodo
      setErrorFormulario((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  async function quitarEvaluacion(evaluacion: Evaluacion) {
    if (!ramo || !window.confirm(`¿Eliminar la evaluación "${evaluacion.nombre}"?`)) {
      return;
    }
    try {
      await eliminarEvaluacion(evaluacion.id);
      await cargar(ramo.id);
      onCambio?.();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const avance = detalle ? detalle.avance : null;

  return (
    <div className="modal-detalle-ramo-overlay" onClick={onCerrar}>
      <div className="modal-detalle-ramo-content" onClick={(evento) => evento.stopPropagation()}>
        <div className="modal-detalle-ramo-header">
          <button
            type="button"
            className="modal-detalle-ramo-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar detalle del ramo"
          >
            ×
          </button>
        </div>

        <div className="modal-detalle-ramo-body">
          <div className="modal-detalle-ramo-identidad">
            <div className="modal-detalle-ramo-logo-contenedor">
              {ramo.logo ? (
                <img src={ramo.logo} alt={`Logo de ${ramo.nombre}`} className="modal-detalle-ramo-logo" />
              ) : (
                <span className="modal-detalle-ramo-logo-vacio">
                    {ramo.nombre.charAt(0).toUpperCase()}
                  </span>
              )}
            </div>

            <div className="modal-detalle-ramo-datos">
              <h2>{ramo.nombre}</h2>
              <p>
                {ramo.codigo}
                {detalle && <> · Período {detalle.periodo.nombre}</>}
              </p>
            </div>
          </div>

          <div className="modal-detalle-ramo-modalidad">
            <span>Modalidad:</span>
            <div className="modal-detalle-ramo-modalidad-valor">{MODALIDADES[ramo.modalidad]}</div>
          </div>

          <EstadoCarga cargando={cargando} error={error} onReintentar={() => cargar(ramo.id)} />

          {detalle && avance && (
            <>
              {/* seguimiento de avance y cumplimiento */}
              <div className="detalle-ramo-avance">
                <h3>Avance</h3>
                <p>
                  Tareas completadas: {avance.tareasCompletadas} de {avance.totalTareas} ({avance.porcentajeTareas}%)
                </p>
                <div className="avance-barra" aria-label={`Avance de tareas ${avance.porcentajeTareas}%`}>
                  <div style={{ width: avance.porcentajeTareas + "%", backgroundColor: ramo.color }} />
                </div>
                <p>
                  Evaluaciones rendidas: {avance.ponderacionRendida}% de {avance.ponderacionTotal}% programado
                </p>
                <p className="avance-promedio">
                  Promedio parcial: {avance.promedioParcial !== null ? avance.promedioParcial.toFixed(1) : "sin notas todavía"}
                </p>
              </div>

              <div className="modal-detalle-ramo-tareas">
                <div className="detalle-ramo-titulo">
                  <h3>Evaluaciones</h3>
                  <button type="button" className="detalle-ramo-agregar" onClick={() => abrirFormulario(null)}>
                    + Agregar
                  </button>
                </div>
                {detalle.evaluaciones.length > 0 ? (
                  <div className="modal-detalle-ramo-lista-tareas">
                    {detalle.evaluaciones.map((evaluacion) => (
                      <div key={evaluacion.id} className="detalle-ramo-evaluacion">
                        <button type="button" onClick={() => abrirFormulario(evaluacion)}>
                          <strong>{evaluacion.nombre}</strong>
                          <span>
                            {TIPOS_EVALUACION[evaluacion.tipo]} · {fechaCortaTexto(evaluacion.fecha)} · {evaluacion.ponderacion}%
                          </span>
                          <span className="detalle-ramo-nota">
                            {evaluacion.nota !== null ? "Nota " + evaluacion.nota.toFixed(1) : "Sin nota"}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="detalle-ramo-quitar"
                          aria-label={"Eliminar " + evaluacion.nombre}
                          onClick={() => quitarEvaluacion(evaluacion)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="modal-detalle-ramo-sin-tareas">Sin evaluaciones registradas.</p>
                )}
              </div>

              <div className="modal-detalle-ramo-tareas">
                <h3>Tareas</h3>
                {detalle.tareas.length > 0 ? (
                  <div className="modal-detalle-ramo-lista-tareas">
                    {detalle.tareas.map((tarea) => (
                      <button
                        type="button"
                        key={tarea.id}
                        className={`modal-detalle-ramo-tarea ${claseEstado(tarea.estado)}`}
                        onClick={() => navigate(`/tareas?id=${tarea.id}`)}
                      >
                        {tarea.nombre}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="modal-detalle-ramo-sin-tareas">Sin tareas asociadas.</p>
                )}
              </div>
            </>
          )}

          <div className="modal-detalle-ramo-footer">
            <button type="button" className="btn-editar-ramo-detalle" onClick={() => onEditar(ramo)}>
              <img src={iconoLapiz} alt="Editar" className="btn-editar-ramo-icono" /> Editar
            </button>
          </div>
        </div>
      </div>

      {/* el formulario va dentro del overlay para quedar encima del detalle */}
      <div onClick={(evento) => evento.stopPropagation()}>
        <Formulario
          abierto={formularioAbierto}
          tipo="evaluacion"
          modo={evaluacionAEditar ? "editar" : "crear"}
          valoresIniciales={
            evaluacionAEditar
              ? {
                  nombre: evaluacionAEditar.nombre,
                  tipo: evaluacionAEditar.tipo,
                  fecha: evaluacionAEditar.fecha,
                  ponderacion: String(evaluacionAEditar.ponderacion),
                  nota: evaluacionAEditar.nota !== null ? String(evaluacionAEditar.nota) : "",
                }
              : undefined
          }
          onCerrar={() => setFormularioAbierto(false)}
          onAceptar={guardarEvaluacion}
          error={errorFormulario}
          enviando={enviando}
        />
      </div>
    </div>
  );
};

export default ModalDetalleRamo;
