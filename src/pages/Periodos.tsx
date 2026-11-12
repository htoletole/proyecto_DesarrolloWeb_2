import { useEffect, useState } from "react";
import HeaderFixed from "../components/HeaderFixed";
import Formulario from "../components/Formulario";
import ModalConfirmacionTareas from "../components/ModalConfirmacionTareas";
import Toast from "../components/Toast";
import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import {
  crearPeriodo,
  editarPeriodo,
  eliminarPeriodo,
  listarPeriodos,
} from "../services/periodosApi";
import type { Periodo } from "../services/periodosApi";
import { fechaCorta, fechaDeHoy } from "../services/fechas";
import { useSesion } from "../services/useSesion";
import "../styles/tareas.css";
import "../styles/periodos.css";

type ModoFormulario = "crear" | "editar";

function Periodos() {
  const sesion = useSesion();
  const hoy = fechaDeHoy();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>("crear");
  const [periodoAEditar, setPeriodoAEditar] = useState<Periodo | null>(null);
  const [periodoAEliminar, setPeriodoAEliminar] = useState<Periodo | null>(null);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tituloAlerta, setTituloAlerta] = useState("");

  // los periodos se piden a la API cuando hay una sesion iniciada
  useEffect(() => {
    if (!sesion) return;

    listarPeriodos()
      .then((lista) => setPeriodos(lista))
      .catch((error) => console.error("Error al cargar períodos:", error));
  }, [sesion?.id]);

  const avisar = (titulo: string, mensaje: string) => {
    setTituloAlerta(titulo);
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
  };

  const abrirFormularioCrear = () => {
    setModoFormulario("crear");
    setPeriodoAEditar(null);
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (periodo: Periodo) => {
    setModoFormulario("editar");
    setPeriodoAEditar(periodo);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setPeriodoAEditar(null);
  };

  const guardarPeriodo = async (datos: Record<string, FormDataEntryValue>) => {
    const nombre = String(datos.nombre ?? "").trim();
    const fechaInicio = String(datos.fechaInicio ?? "");
    const fechaFin = String(datos.fechaFin ?? "");

    if (fechaFin < fechaInicio) {
      alert("La fecha de término debe ser después de la fecha de inicio.");
      return;
    }

    try {
      if (modoFormulario === "crear") {
        const creado = await crearPeriodo(nombre, fechaInicio, fechaFin);
        setPeriodos((actuales) => [...actuales, creado]);
        avisar("Período creado", `¡Período "${creado.nombre}" creado con éxito!`);
      } else if (periodoAEditar) {
        const editado = await editarPeriodo(periodoAEditar.id, nombre, fechaInicio, fechaFin);
        // la respuesta de editar no trae la cantidad de ramos, se mantiene la que habia
        setPeriodos((actuales) =>
          actuales.map((p) =>
            p.id === editado.id ? { ...editado, cantidadRamos: p.cantidadRamos } : p,
          ),
        );
        avisar("Período editado", `¡El período "${editado.nombre}" se modificó con éxito!`);
      }
    } catch (error) {
      alert((error as Error).message);
      return;
    }

    cerrarFormulario();
  };

  const confirmarEliminacion = async () => {
    if (!periodoAEliminar) return;

    try {
      await eliminarPeriodo(periodoAEliminar.id);
    } catch (error) {
      // la API no deja borrar un periodo con ramos
      alert((error as Error).message);
      setPeriodoAEliminar(null);
      return;
    }

    setPeriodos((actuales) => actuales.filter((p) => p.id !== periodoAEliminar.id));
    avisar("Período eliminado", `¡Se eliminó el período "${periodoAEliminar.nombre}"!`);
    setPeriodoAEliminar(null);
  };

  // el mas reciente primero
  const ordenados = [...periodos].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));

  const valoresIniciales = periodoAEditar
    ? {
        nombre: periodoAEditar.nombre,
        fechaInicio: periodoAEditar.fechaInicio,
        fechaFin: periodoAEditar.fechaFin,
      }
    : undefined;

  return (
    <div className="min-vh-100 w-100 page-container periodos-page">
      <HeaderFixed titulo="Períodos" />

      <main className="content-container">
        <div className="info-banner info-banner-periodos">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Los ramos nuevos se guardan en el período que está en curso. Presiona uno para editarlo.</p>
        </div>

        <div className="action-buttons-container">
          <button type="button" className="btn-crear btn-crear-periodos" onClick={abrirFormularioCrear}>
            Crear Período
            <img src={iconoMas} alt="Crear período" className="btn-icon" />
          </button>
        </div>

        {ordenados.length === 0 && (
          <p className="periodos-vacio">Todavía no tienes períodos. Se crea uno solo al crear tu primer ramo.</p>
        )}

        <div className="periodos-lista">
          {ordenados.map((periodo) => {
            const enCurso = periodo.fechaInicio <= hoy && hoy <= periodo.fechaFin;

            return (
              <div
                key={periodo.id}
                className={`periodo-card ${enCurso ? "en-curso" : ""}`}
                onClick={() => abrirFormularioEditar(periodo)}
              >
                <div className="periodo-card-info">
                  <h3>
                    {periodo.nombre}
                    {enCurso && <span className="periodo-badge">En curso</span>}
                  </h3>
                  <p>
                    {fechaCorta(periodo.fechaInicio)} al {fechaCorta(periodo.fechaFin)}
                  </p>
                  <p className="periodo-ramos">
                    {periodo.cantidadRamos} {periodo.cantidadRamos === 1 ? "ramo" : "ramos"}
                  </p>
                </div>

                <button
                  type="button"
                  className="periodo-card-eliminar"
                  aria-label={`Eliminar ${periodo.nombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPeriodoAEliminar(periodo);
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <Formulario
        abierto={formularioAbierto}
        tipo="periodo"
        modo={modoFormulario}
        valoresIniciales={valoresIniciales}
        onCerrar={cerrarFormulario}
        onAceptar={guardarPeriodo}
      />

      <ModalConfirmacionTareas
        abierto={periodoAEliminar !== null}
        mensaje="¿Desea confirmar la eliminación del período? Solo se puede eliminar si no tiene ramos."
        onConfirmar={confirmarEliminacion}
        onDenegar={() => setPeriodoAEliminar(null)}
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

export default Periodos;
