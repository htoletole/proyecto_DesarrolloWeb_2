import { useEffect, useState } from "react";
import HeaderFixed from "../components/HeaderFixed";
import Formulario from "../components/Formulario";
import ModalDetalleRamo from "../components/ModalDetalleRamo";
import ModalConfirmacionRamos from "../components/ModalConfirmacionRamos";
import EstadoCarga from "../components/EstadoCarga";
import Toast from "../components/Toast";
import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import iconoLapiz from "../assets/icons/lapiz.png";
import iconoCheck from "../assets/icons/check.png";
import { MODALIDADES } from "../services/etiquetas";
import {
  crearPeriodo,
  crearRamo,
  editarRamo,
  eliminarPeriodo,
  eliminarRamo,
  listarPeriodos,
  listarRamos,
} from "../services/ramosApi";
import type { DatosRamo } from "../services/ramosApi";
import type { Modalidad, Periodo, Ramo } from "../services/tipos";
import { useSesion } from "../services/useSesion";
import "../styles/ramos.css";

type VistaRamos = "grid" | "lista";
type ModoFormulario = "crear" | "editar";

const TAMANO_MAX_LOGO = 500000;

// preferencias de pantalla (no son datos del sistema, por eso pueden ir en localStorage)
const CLAVE_VISTA = "vistaRamos";
const CLAVE_PERIODO = "periodoRamos";

const convertirImagenBase64 = (archivo: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    lector.readAsDataURL(archivo);
  });

// elige el periodo guardado, o el que esta en curso, o el mas reciente
function elegirPeriodo(periodos: Periodo[]): number {
  const guardado = Number(localStorage.getItem(CLAVE_PERIODO));
  if (periodos.some((periodo) => periodo.id === guardado)) {
    return guardado;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const enCurso = periodos.find((periodo) => periodo.fechaInicio <= hoy && hoy <= periodo.fechaFin);
  if (enCurso) {
    return enCurso.id;
  }

  return periodos.length > 0 ? periodos[0].id : 0;
}

function Ramos() {
  const sesion = useSesion();

  const [vista, setVista] = useState<VistaRamos>(() => {
    const guardada = localStorage.getItem(CLAVE_VISTA);
    return guardada === "lista" ? "lista" : "grid";
  });

  // datos que vienen de la API
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState(0);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [formularioPeriodoAbierto, setFormularioPeriodoAbierto] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>("crear");
  const [ramoAEditar, setRamoAEditar] = useState<Ramo | null>(null);
  const [ramoEnDetalle, setRamoEnDetalle] = useState<Ramo | null>(null);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [ramosSeleccionados, setRamosSeleccionados] = useState<number[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [ramosConTareas, setRamosConTareas] = useState<string[]>([]);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [alertaError, setAlertaError] = useState(false);

  function avisar(titulo: string, mensaje: string, esError = false) {
    setTituloAlerta(titulo);
    setMensajeAlerta(mensaje);
    setAlertaError(esError);
    setMostrarAlerta(true);
  }

  useEffect(() => {
    localStorage.setItem(CLAVE_VISTA, vista);
  }, [vista]);

  // primero los periodos, despues los ramos del periodo elegido
  async function cargarPeriodos() {
    setCargando(true);
    setError("");
    try {
      const lista = await listarPeriodos();
      setPeriodos(lista);
      const elegido = elegirPeriodo(lista);
      setPeriodoId(elegido);
      if (elegido === 0) {
        setRamos([]);
        setCargando(false);
      }
    } catch (e) {
      setError((e as Error).message);
      setCargando(false);
    }
  }

  async function cargarRamos(id: number) {
    setCargando(true);
    setError("");
    try {
      setRamos(await listarRamos(id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (sesion) {
      cargarPeriodos();
    }
  }, [sesion?.id]);

  useEffect(() => {
    if (periodoId !== 0) {
      localStorage.setItem(CLAVE_PERIODO, String(periodoId));
      cargarRamos(periodoId);
    }
  }, [periodoId]);

  const abrirFormularioCrear = () => {
    setModoFormulario("crear");
    setRamoAEditar(null);
    setErrorFormulario("");
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (ramo: Ramo) => {
    setModoFormulario("editar");
    setRamoAEditar(ramo);
    setRamoEnDetalle(null);
    setErrorFormulario("");
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setRamoAEditar(null);
  };

  const guardarRamo = async (datos: Record<string, FormDataEntryValue>) => {
    const datosRamo: DatosRamo = {
      codigo: String(datos.codigo ?? "").trim(),
      nombre: String(datos.nombre ?? "").trim(),
      modalidad: String(datos.modalidad ?? "") as Modalidad,
      color: String(datos.colorRamo ?? "#FFAE52"),
      periodoId: Number(datos.periodoId),
    };

    // el logo solo se manda si se eligio uno nuevo
    if (datos.logo instanceof File && datos.logo.size > 0) {
      if (datos.logo.size > TAMANO_MAX_LOGO) {
        setErrorFormulario("El logo debe pesar menos de 500 KB.");
        return;
      }
      datosRamo.logo = await convertirImagenBase64(datos.logo);
    }

    setEnviando(true);
    setErrorFormulario("");
    try {
      if (modoFormulario === "crear") {
        await crearRamo(datosRamo);
        avisar("Ramo creado", `¡Ramo "${datosRamo.nombre}" creado con éxito!`);
      } else if (ramoAEditar) {
        await editarRamo(ramoAEditar.id, datosRamo);
        avisar("Ramo editado", `¡El ramo "${datosRamo.nombre}" se editó con éxito!`);
      }
      cerrarFormulario();

      // si se movio a otro periodo, se muestra ese periodo
      if (datosRamo.periodoId !== periodoId) {
        setPeriodoId(datosRamo.periodoId);
      } else {
        cargarRamos(periodoId);
      }
    } catch (e) {
      // por ejemplo: ya existe un ramo con esa ID en el periodo
      setErrorFormulario((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const guardarPeriodo = async (datos: Record<string, FormDataEntryValue>) => {
    setEnviando(true);
    setErrorFormulario("");
    try {
      const nuevo = await crearPeriodo(
        String(datos.nombre ?? "").trim(),
        String(datos.fechaInicio ?? ""),
        String(datos.fechaFin ?? ""),
      );
      setPeriodos([nuevo, ...periodos]);
      setPeriodoId(nuevo.id);
      setFormularioPeriodoAbierto(false);
      avisar("Período creado", `¡Período "${nuevo.nombre}" creado con éxito!`);
    } catch (e) {
      setErrorFormulario((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const borrarPeriodo = async () => {
    const periodo = periodos.find((p) => p.id === periodoId);
    if (!periodo || !window.confirm(`¿Eliminar el período "${periodo.nombre}"?`)) {
      return;
    }
    try {
      await eliminarPeriodo(periodo.id);
      localStorage.removeItem(CLAVE_PERIODO);
      avisar("Período eliminado", `Se eliminó el período "${periodo.nombre}".`);
      cargarPeriodos();
    } catch (e) {
      // regla: no se puede borrar un periodo con ramos
      avisar("No se pudo eliminar", (e as Error).message, true);
    }
  };

  const toggleModoSeleccion = () => {
    setModoSeleccion((actual) => !actual);
    setRamosSeleccionados([]);
    setRamosConTareas([]);
    setRamoEnDetalle(null);
    setModalEliminarAbierto(false);
  };

  const toggleSeleccionRamo = (id: number) => {
    setRamosSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((ramoId) => ramoId !== id)
        : [...actuales, id],
    );
  };

  const abrirConfirmacionEliminacion = () => {
    // la API cuenta cuantas tareas tiene cada ramo
    const conTareas = ramos
      .filter((ramo) => ramosSeleccionados.includes(ramo.id))
      .filter((ramo) => (ramo._count?.tareas ?? 0) > 0)
      .map((ramo) => ramo.nombre);

    setRamosConTareas(conTareas);
    setModalEliminarAbierto(true);
  };

  const eliminarRamosSeleccionados = async () => {
    setModalEliminarAbierto(false);
    try {
      // al borrar un ramo, la base de datos tambien borra sus tareas y evaluaciones
      await Promise.all(ramosSeleccionados.map((id) => eliminarRamo(id)));
      avisar("Ramo eliminado", "¡Se eliminaron con éxito los ramos seleccionados!");
    } catch (e) {
      avisar("No se pudo eliminar", (e as Error).message, true);
    }

    setModoSeleccion(false);
    setRamosSeleccionados([]);
    setRamosConTareas([]);
    setRamoEnDetalle(null);
    cargarRamos(periodoId);
  };

  const manejarClickRamo = (ramo: Ramo) => {
    if (modoSeleccion) toggleSeleccionRamo(ramo.id);
    else setRamoEnDetalle(ramo);
  };

  const valoresIniciales: Record<string, string> = ramoAEditar
    ? {
        nombre: ramoAEditar.nombre,
        codigo: ramoAEditar.codigo,
        modalidad: ramoAEditar.modalidad,
        colorRamo: ramoAEditar.color,
        periodoId: String(ramoAEditar.periodoId),
      }
    : { periodoId: String(periodoId) };

  const opcionesPeriodo = periodos.map((periodo) => ({ valor: String(periodo.id), texto: periodo.nombre }));

  return (
    <div className="min-vh-100 w-100 page-container ramos-page">
      <HeaderFixed titulo="Ramos" />

      <main className="content-container">
        <div className="info-banner info-banner-ramos">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona un ramo para ver más información sobre este.</p>
        </div>

        {/* periodos academicos */}
        <div className="ramos-periodo">
          <label htmlFor="selector-periodo">Período:</label>
          <select
            id="selector-periodo"
            value={periodoId}
            onChange={(evento) => setPeriodoId(Number(evento.target.value))}
            disabled={periodos.length === 0}
          >
            {periodos.length === 0 && <option value={0}>Sin períodos</option>}
            {periodos.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ramos-periodo-boton"
            onClick={() => {
              setErrorFormulario("");
              setFormularioPeriodoAbierto(true);
            }}
          >
            + Nuevo período
          </button>
          {periodoId !== 0 && (
            <button type="button" className="ramos-periodo-boton ramos-periodo-borrar" onClick={borrarPeriodo}>
              Eliminar período
            </button>
          )}
        </div>

        <div className="action-buttons-container">
          <div className="ramos-acciones-principales">
            <button
              type="button"
              className="btn-crear btn-crear-ramos"
              onClick={abrirFormularioCrear}
              disabled={periodoId === 0}
            >
              Crear Ramo
              <img src={iconoMas} alt="Crear ramo" className="btn-icon" />
            </button>

            {modoSeleccion && ramosSeleccionados.length > 0 && (
              <button
                type="button"
                className="btn-eliminar-ramos"
                onClick={abrirConfirmacionEliminacion}
              >
                Eliminar
              </button>
            )}
          </div>

          <div className="ramos-controles">
            <button
              type="button"
              className={`btn-seleccionar-ramos ${
                modoSeleccion ? "activo" : ""
              }`}
              onClick={toggleModoSeleccion}
              title={modoSeleccion ? "Cancelar selección" : "Seleccionar ramos"}
              aria-label={
                modoSeleccion ? "Cancelar selección" : "Seleccionar ramos"
              }
            >
              <img
                src={iconoLapiz}
                alt="Seleccionar"
                className="btn-seleccionar-ramos-icono"
              />
            </button>

            <div className="ramos-view-selector">
              <button
                type="button"
                className={`ramos-view-button ${
                  vista === "lista" ? "active" : ""
                }`}
                onClick={() => setVista("lista")}
                aria-label="Vista de lista"
              >
                ☷
              </button>

              <button
                type="button"
                className={`ramos-view-button ${
                  vista === "grid" ? "active" : ""
                }`}
                onClick={() => setVista("grid")}
                aria-label="Vista de cuadrícula"
              >
                ▦
              </button>
            </div>
          </div>
        </div>

        <EstadoCarga
          cargando={cargando}
          error={error}
          vacio={ramos.length === 0}
          mensajeVacio={periodoId === 0 ? "Crea un período para empezar a agregar ramos." : "Este período no tiene ramos. ¡Crea el primero!"}
          onReintentar={cargarPeriodos}
        />

        {!cargando && error === "" && (
          <section className={vista === "grid" ? "ramos-grid" : "ramos-list"}>
            {ramos.map((ramo) => {
              const seleccionado = ramosSeleccionados.includes(ramo.id);

              return (
                <div
                  key={ramo.id}
                  className={`ramo-card ${
                    modoSeleccion ? "modo-seleccion" : ""
                  } ${seleccionado ? "seleccionado" : ""}`}
                  style={{ backgroundColor: ramo.color }}
                  onClick={() => manejarClickRamo(ramo)}
                >
                  {seleccionado && (
                    <img
                      src={iconoCheck}
                      alt="Ramo seleccionado"
                      className="ramo-check-seleccion"
                    />
                  )}

                  <div className="ramo-card-superior">
                    <div className="ramo-card-logo-contenedor">
                      {ramo.logo ? (
                        <img
                          src={ramo.logo}
                          alt={`Logo de ${ramo.nombre}`}
                          className="ramo-card-logo"
                        />
                      ) : (
                        <span className="ramo-card-logo-vacio">
                          {ramo.nombre.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="ramo-card-info">
                      <h3>{ramo.nombre}</h3>
                      <p className="ramo-card-id">{ramo.codigo}</p>
                    </div>

                    <span className="ramo-card-flecha">›</span>
                  </div>

                  <div className="ramo-card-divisor" />

                  <div className="ramo-card-detalle">
                    <span className="ramo-card-detalle-icono">◉</span>

                    <div>
                      <span className="ramo-card-detalle-titulo">Modalidad</span>
                      <p>{MODALIDADES[ramo.modalidad]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      <Formulario
        abierto={formularioAbierto}
        tipo="ramo"
        modo={modoFormulario}
        valoresIniciales={valoresIniciales}
        opcionesPeriodo={opcionesPeriodo}
        onCerrar={cerrarFormulario}
        onAceptar={guardarRamo}
        error={errorFormulario}
        enviando={enviando}
      />

      <Formulario
        abierto={formularioPeriodoAbierto}
        tipo="periodo"
        modo="crear"
        onCerrar={() => setFormularioPeriodoAbierto(false)}
        onAceptar={guardarPeriodo}
        error={errorFormulario}
        enviando={enviando}
      />

      <ModalDetalleRamo
        abierto={ramoEnDetalle !== null}
        ramo={ramoEnDetalle}
        onCerrar={() => setRamoEnDetalle(null)}
        onEditar={abrirFormularioEditar}
        onCambio={() => cargarRamos(periodoId)}
      />

      <ModalConfirmacionRamos
        abierto={modalEliminarAbierto}
        mensaje="¿Desea confirmar la eliminación de los ramos seleccionados?"
        elementosAdvertencia={ramosConTareas}
        textoAdvertencia="Al confirmar, también se eliminarán las tareas y evaluaciones de estos ramos. ¿Desea continuar?"
        onConfirmar={eliminarRamosSeleccionados}
        onDenegar={() => setModalEliminarAbierto(false)}
      />

      <Toast
        mostrar={mostrarAlerta}
        mensaje={mensajeAlerta}
        titulo={tituloAlerta}
        error={alertaError}
        onClose={() => setMostrarAlerta(false)}
      />
    </div>
  );
}

export default Ramos;
