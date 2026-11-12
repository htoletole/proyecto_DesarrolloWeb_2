import { useEffect, useState } from "react";
import HeaderFixed from "../components/HeaderFixed";
import Formulario from "../components/Formulario";
import ModalDetalleRamo from "../components/ModalDetalleRamo";
import ModalConfirmacionRamos from "../components/ModalConfirmacionRamos";
import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import iconoLapiz from "../assets/icons/lapiz.png";
import iconoCheck from "../assets/icons/check.png";
import "../styles/ramos.css";
import Toast from "../components/Toast";
import { EsqueletoRamos } from "../components/Esqueletos";
import { colorDeTexto } from "../services/colores";
import {
  crearRamo,
  editarRamo,
  eliminarRamo,
  listarRamos,
} from "../services/ramosApi";
import { listarTareas } from "../services/tareasApi";
import { useSesion } from "../services/useSesion";

type VistaRamos = "grid" | "lista";
type ModoFormulario = "crear" | "editar";

export type Ramo = {
  id: string;
  nombre: string;
  modalidad: string;
  colorRamo: string;
  logo?: string;
};

const TAMANO_MAX_LOGO = 500000;

const convertirImagenBase64 = (archivo: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    lector.readAsDataURL(archivo);
  });

const normalizarTexto = (texto: string) => texto.trim().toLowerCase();

function Ramos() {
  const sesion = useSesion();

  const [vista, setVista] = useState<VistaRamos>(() => {
    const guardada = localStorage.getItem("vistaRamos");
    return guardada === "lista" ? "lista" : "grid";
  });

  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [cargando, setCargando] = useState(true);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>("crear");
  const [ramoAEditar, setRamoAEditar] = useState<Ramo | null>(null);
  const [ramoEnDetalle, setRamoEnDetalle] = useState<Ramo | null>(null);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [ramosSeleccionados, setRamosSeleccionados] = useState<string[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [ramosConTareas, setRamosConTareas] = useState<string[]>([]);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tituloAlerta, setTituloAlerta] = useState("");

  // los ramos se piden a la API cuando hay una sesion iniciada
  useEffect(() => {
    if (!sesion) return;

    // el esqueleto se ve hasta que llegan los ramos
    setCargando(true);
    listarRamos()
      .then((lista) => setRamos(lista))
      .catch((error) => console.error("Error al cargar ramos:", error))
      .finally(() => setCargando(false));
  }, [sesion?.id]);

  useEffect(() => {
    localStorage.setItem("vistaRamos", vista);
  }, [vista]);

  const abrirFormularioCrear = () => {
    setModoFormulario("crear");
    setRamoAEditar(null);
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (ramo: Ramo) => {
    setModoFormulario("editar");
    setRamoAEditar(ramo);
    setRamoEnDetalle(null);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setRamoAEditar(null);
  };

  const guardarRamo = async (datos: Record<string, FormDataEntryValue>) => {
    const datosRamo = {
      id: String(datos.id ?? "").trim(),
      nombre: String(datos.nombre ?? "").trim(),
      modalidad: String(datos.modalidad ?? ""),
      colorRamo: String(datos.colorRamo ?? "#FFAE52"),
    };

    const idDuplicado = ramos.some(
      (ramo) =>
        ramo.id !== ramoAEditar?.id &&
        normalizarTexto(ramo.id) === normalizarTexto(datosRamo.id),
    );

    if (idDuplicado) {
      alert("Ya existe un ramo con esa ID.");
      return;
    }

    const nombreDuplicado = ramos.some(
      (ramo) =>
        ramo.id !== ramoAEditar?.id &&
        normalizarTexto(ramo.nombre) === normalizarTexto(datosRamo.nombre),
    );

    if (nombreDuplicado) {
      alert("Ya existe un ramo con ese nombre.");
      return;
    }

    let logo = ramoAEditar?.logo;

    if (datos.logo instanceof File && datos.logo.size > 0) {
      if (datos.logo.size > TAMANO_MAX_LOGO) {
        alert("El logo debe pesar menos de 500 KB.");
        return;
      }

      logo = await convertirImagenBase64(datos.logo);
    }

    try {
    if (modoFormulario === "crear") {
      const creado = await crearRamo({ ...datosRamo, logo });
      setRamos((actuales) => [...actuales, creado]);
      setTituloAlerta("Ramo creado");
      setMensajeAlerta(`¡Ramo "${datosRamo.nombre}" creado con éxito!`);
      setMostrarAlerta(true);
    } else if (ramoAEditar) {
      const editado = await editarRamo(ramoAEditar.id, { ...datosRamo, logo });
      setRamos((actuales) =>
        actuales.map((ramo) => (ramo.id === ramoAEditar.id ? editado : ramo)),
      );

      // las tareas del ramo quedan con el nombre nuevo porque en la base estan unidas al ramo
      if (ramoAEditar.nombre !== datosRamo.nombre) {
        setTituloAlerta("Ramo editado");
        setMensajeAlerta(
          `¡El ramo "${ramoAEditar.nombre}" se editó con éxito!`,
        );
        setMostrarAlerta(true);
      }
    }
    } catch (error) {
      // la API no pudo guardar
      alert((error as Error).message);
      return;
    }

    cerrarFormulario();
  };

  const toggleModoSeleccion = () => {
    setModoSeleccion((actual) => !actual);
    setRamosSeleccionados([]);
    setRamosConTareas([]);
    setRamoEnDetalle(null);
    setModalEliminarAbierto(false);
  };

  const toggleSeleccionRamo = (id: string) => {
    setRamosSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((ramoId) => ramoId !== id)
        : [...actuales, id],
    );
  };

  const abrirConfirmacionEliminacion = async () => {
    const tareas = await listarTareas().catch(() => []);

    const conTareas = ramos
      .filter((ramo) => ramosSeleccionados.includes(ramo.id))
      .filter((ramo) =>
        tareas.some((tarea) => tarea.asignatura === ramo.nombre),
      )
      .map((ramo) => ramo.nombre);

    setRamosConTareas(conTareas);
    setModalEliminarAbierto(true);
  };

  const eliminarRamosSeleccionados = async () => {
    // al eliminar un ramo, la base de datos tambien elimina sus tareas
    try {
      await Promise.all(ramosSeleccionados.map((id) => eliminarRamo(id)));
    } catch (error) {
      alert((error as Error).message);
      return;
    }

    setTituloAlerta("Ramo eliminado");
    setMensajeAlerta(`¡Se eliminaron con éxito los ramos eliminados!`);
    setMostrarAlerta(true);

    setRamos((actuales) =>
      actuales.filter((ramo) => !ramosSeleccionados.includes(ramo.id)),
    );

    setModalEliminarAbierto(false);
    setModoSeleccion(false);
    setRamosSeleccionados([]);
    setRamosConTareas([]);
    setRamoEnDetalle(null);
  };

  const manejarClickRamo = (ramo: Ramo) => {
    if (modoSeleccion) toggleSeleccionRamo(ramo.id);
    else setRamoEnDetalle(ramo);
  };

  const valoresIniciales = ramoAEditar
    ? {
        nombre: ramoAEditar.nombre,
        id: ramoAEditar.id,
        modalidad: ramoAEditar.modalidad,
        colorRamo: ramoAEditar.colorRamo,
      }
    : undefined;

  return (
    <div className="min-vh-100 w-100 page-container ramos-page">
      <HeaderFixed titulo="Ramos" />

      <main className="content-container">
        <div className="info-banner info-banner-ramos">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona un ramo para ver más información sobre este.</p>
        </div>

        <div className="action-buttons-container">
          <div className="ramos-acciones-principales">
            <button
              type="button"
              className="btn-crear btn-crear-ramos"
              onClick={abrirFormularioCrear}
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

        {cargando ? (
          <EsqueletoRamos vista={vista} />
        ) : (
          <section className={vista === "grid" ? "ramos-grid" : "ramos-list"}>
            {ramos.map((ramo, index) => {
              const seleccionado = ramosSeleccionados.includes(ramo.id);

              return (
                <div
                  key={`${ramo.id}-${index}`}
                  className={`ramo-card ${
                    modoSeleccion ? "modo-seleccion" : ""
                  } ${seleccionado ? "seleccionado" : "texto-contraste"}`}
                  // el texto de la tarjeta va en gris oscuro o blanco segun el color del ramo (ver ramos.css)
                  style={
                    {
                      backgroundColor: ramo.colorRamo,
                      "--ramo-texto": colorDeTexto(ramo.colorRamo),
                    } as React.CSSProperties
                  }
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
                      <p className="ramo-card-id">{ramo.id}</p>
                    </div>

                    <span className="ramo-card-flecha">›</span>
                  </div>

                  <div className="ramo-card-divisor" />

                  <div className="ramo-card-detalle">
                    <span className="ramo-card-detalle-icono">◉</span>

                    <div>
                      <span className="ramo-card-detalle-titulo">Modalidad</span>
                      <p>{ramo.modalidad}</p>
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
        onCerrar={cerrarFormulario}
        onAceptar={guardarRamo}
      />

      <ModalDetalleRamo
        abierto={ramoEnDetalle !== null}
        ramo={ramoEnDetalle}
        onCerrar={() => setRamoEnDetalle(null)}
        onEditar={abrirFormularioEditar}
      />

      <ModalConfirmacionRamos
        abierto={modalEliminarAbierto}
        mensaje="¿Desea confirmar la eliminación de los ramos seleccionados?"
        elementosAdvertencia={ramosConTareas}
        textoAdvertencia="Al confirmar, también se eliminarán las tareas asignadas a estos ramos. ¿Desea continuar?"
        onConfirmar={eliminarRamosSeleccionados}
        onDenegar={() => setModalEliminarAbierto(false)}
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

export default Ramos;
