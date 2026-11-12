import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderGeneral from "../components/HeaderFixed";
import Navbar from "../components/Navbar";
import SearchBarTareas from "../components/SearchBarTareas";
import KanbanBoardTareas from "../components/KanbanBoardTareasDefinitivo";
import Formulario from "../components/Formulario";
import ModalConfirmacionTareas from "../components/ModalConfirmacionTareas";
import ModalDetalleTarea from "../components/ModalDetalleTarea";
import { EsqueletoTareas } from "../components/Esqueletos";

import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import iconoFiltro from "../assets/icons/filtro.png";
import iconoLapiz from "../assets/icons/lapiz.png";
import "../styles/tareas.css";
import Toast from "../components/Toast";
import { listarRamos } from "../services/ramosApi";
import {
  crearTarea,
  editarTarea,
  eliminarTarea,
  listarTareas,
} from "../services/tareasApi";
import { useSesion } from "../services/useSesion";

export type Tarea = {
  id: string;
  nombre: string;
  descripcion: string;
  asignatura: string;
  estado: string;
  prioridad: string;
  horaEntrega: string;
  fecha?: string;
};

function Tareas() {
  const sesion = useSesion();
  const [tipoFiltro, setTipoFiltro] = useState("normal");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [opcionesRamos, setOpcionesRamos] = useState<string[]>([]);
  const [coloresRamos, setColoresRamos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [busqueda, setBusqueda] = useState("");

  // Estados de modo selección/borrado
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<string[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // estados modales para el formulario, crear y editar
  const [tareaEnDetalle, setTareaEnDetalle] = useState<Tarea | null>(null);
  const [modoFormulario, setModoFormulario] = useState<"crear" | "editar">(
    "crear",
  );
  const [tareaAEditar, setTareaAEditar] = useState<Tarea | null>(null);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tituloAlerta, setTituloAlerta] = useState("");

  // los ramos y las tareas se piden a la API cuando hay una sesion iniciada
  useEffect(() => {
    if (!sesion) return;

    // mientras llegan los datos se muestra el esqueleto de carga
    setCargando(true);

    const pedirRamos = listarRamos()
      .then((ramos) => {
        setOpcionesRamos(ramos.map((ramo) => ramo.nombre));
        const colores: Record<string, string> = {};
        for (const ramo of ramos) {
          colores[ramo.nombre] = ramo.colorRamo;
        }
        setColoresRamos(colores);
      })
      .catch((error) => console.error("Error al cargar ramos:", error));

    const pedirTareas = listarTareas()
      .then((lista) => setTareas(lista))
      .catch((error) => console.error("Error al cargar tareas:", error));

    Promise.allSettled([pedirRamos, pedirTareas]).then(() => setCargando(false));
  }, [sesion?.id]);

  const aplicarFiltro = (filtro: string) => {
    setTipoFiltro(filtro);
    setMenuAbierto(false);
  };

  // formulario
  const abrirFormularioCrear = () => {
    setModoFormulario("crear");
    setTareaAEditar(null);
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (tarea: Tarea) => {
    setModoFormulario("editar");
    setTareaAEditar(tarea);
    setFormularioAbierto(true);
    setTareaEnDetalle(null); //cierra el popup de detalles al abrir el formulario
  };

  const guardarTarea = async (datos: Record<string, FormDataEntryValue>) => {
    try {
    if (modoFormulario === "crear") {
      //creacion (el id lo pone la base de datos)
      const datosTarea: Tarea = {
        id: "",
        nombre: String(datos.nombre ?? ""),
        descripcion: String(datos.descripcion ?? ""),
        asignatura: String(datos.asignatura ?? ""),
        estado: String(datos.estado ?? "Pendiente"),
        prioridad: String(datos.prioridad ?? "Baja"),
        horaEntrega: String(datos.horaEntrega ?? ""),
        fecha: String(datos.fecha ?? ""),
      };
      const nuevaTarea = await crearTarea(datosTarea);
      setTareas([...tareas, nuevaTarea]);
      setTituloAlerta("Tarea creada");
      setMensajeAlerta(`¡Tarea "${nuevaTarea.nombre}" creada con éxito!`);
      setMostrarAlerta(true);
    } else if (modoFormulario === "editar" && tareaAEditar) {
      //edicion
      const editada = await editarTarea({
        ...tareaAEditar,
        nombre: String(datos.nombre ?? ""),
        descripcion: String(datos.descripcion ?? ""),
        asignatura: String(datos.asignatura ?? ""),
        estado: String(datos.estado ?? "Pendiente"),
        prioridad: String(datos.prioridad ?? "Baja"),
        horaEntrega: String(datos.horaEntrega ?? ""),
        fecha: String(datos.fecha ?? ""),
      });
      const tareasActualizadas = tareas.map((t) => {
        if (t.id === tareaAEditar.id) {
          return editada;
        }
        return t;
      });
      setTareas(tareasActualizadas);
      setTituloAlerta("Tarea actualizada");
      setMensajeAlerta(
        `¡La tarea "${tareaAEditar.nombre}" se modificó exitosamente!`,
      );
      setMostrarAlerta(true);
    }
    } catch (error) {
      // la API no pudo guardar (por ejemplo, se cayo la conexion)
      alert((error as Error).message);
      return;
    }
    setFormularioAbierto(false);
    setTareaAEditar(null);
  };

  //seccion seleccion y borrado
  const toggleModoEdicion = () => {
    setModoEdicion(!modoEdicion);
    setTareasSeleccionadas([]);
  };

  const toggleSeleccionTarea = (id: string) => {
    if (tareasSeleccionadas.includes(id)) {
      setTareasSeleccionadas(tareasSeleccionadas.filter((tId) => tId !== id));
    } else {
      setTareasSeleccionadas([...tareasSeleccionadas, id]);
    }
  };

  const eliminarTareasSeleccionadas = async () => {
    try {
      await Promise.all(tareasSeleccionadas.map((id) => eliminarTarea(id)));
    } catch (error) {
      alert((error as Error).message);
      return;
    }
    const nuevasTareas = tareas.filter(
      (tarea) => !tareasSeleccionadas.includes(tarea.id),
    );
    setTareas(nuevasTareas);
    setTituloAlerta("Tarea eliminada");
    setMensajeAlerta(`¡Se eliminaron correctamente las tareas seleccionadas!`);
    setMostrarAlerta(true);
    setModalEliminarAbierto(false);
    setModoEdicion(false);
    setTareasSeleccionadas([]);
  };

  // al cambiar una subtarea la API puede cambiar el estado de la tarea, asi que se vuelven a pedir
  const recargarTareas = () => {
    listarTareas()
      .then((lista) => {
        setTareas(lista);
        setTareaEnDetalle((actual) =>
          actual ? (lista.find((t) => t.id === actual.id) ?? actual) : null,
        );
      })
      .catch((error) => console.error("Error al cargar tareas:", error));
  };

  //Funciones Modal Detalles
  const abrirDetalle = (tarea: Tarea) => setTareaEnDetalle(tarea);
  const cerrarDetalle = () => setTareaEnDetalle(null);

  const tareasFiltradas = tareas.filter((tarea) =>
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Abrir el Modal Detalles con el ID desde el link
  const [searchParams, setSearchParams] = useSearchParams();
  const tareaId = searchParams.get("id");

  useEffect(() => {
    if (tareaId) {
      const tareaPorId = tareas.find((t) => t.id === tareaId);
      if (tareaPorId) {
        abrirDetalle(tareaPorId);
        setSearchParams({});
      }
    } else {
      return;
    }
  }, [tareaId, tareas]);

  return (
    <div className="min-vh-100 w-100 page-container">
      <HeaderGeneral titulo="Tareas" />

      <main className="content-container">
        <SearchBarTareas busqueda={busqueda} setBusqueda={setBusqueda} />

        <div className="info-banner">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona una tarea para ver mas informacion sobre esta.</p>
        </div>

        <div className="action-buttons-container">
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-crear" onClick={abrirFormularioCrear}>
              Crear Tarea{" "}
              <img src={iconoMas} alt="Crear" className="btn-icon" />
            </button>
            {modoEdicion && tareasSeleccionadas.length > 0 && (
              <button
                className="btn-eliminar"
                onClick={() => setModalEliminarAbierto(true)}
              >
                Eliminar
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              className={`btn-editar ${modoEdicion ? "activo" : ""}`}
              onClick={toggleModoEdicion}
              title={modoEdicion ? "Cancelar edición" : "Activar edición"}
            >
              <img src={iconoLapiz} alt="Editar" className="btn-icon-lapiz" />
            </button>

            <div style={{ position: "relative" }}>
              <button
                className="btn-filtrar"
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                Filtrar{" "}
                <img src={iconoFiltro} alt="Filtrar" className="btn-icon" />
              </button>

              {menuAbierto && (
                <div className="filtro-dropdown">
                  <button onClick={() => aplicarFiltro("normal")}>
                    Por Estado
                  </button>
                  <button onClick={() => aplicarFiltro("prioridad")}>
                    Por Prioridad
                  </button>
                  <button onClick={() => aplicarFiltro("ramo")}>
                    Por Ramo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {cargando ? (
          <EsqueletoTareas />
        ) : (
          <KanbanBoardTareas
            tareas={tareasFiltradas}
            ramos={opcionesRamos}
            modoEdicion={modoEdicion}
            tareasSeleccionadas={tareasSeleccionadas}
            onToggleSeleccion={toggleSeleccionTarea}
            onVerDetalle={abrirDetalle}
            filtro={tipoFiltro}
            coloresRamos={coloresRamos}
          />
        )}
      </main>

      <Navbar />

      {/* se entregan los valores iniciales si se esta editando */}
      <Formulario
        abierto={formularioAbierto}
        tipo="tarea"
        modo={modoFormulario}
        valoresIniciales={tareaAEditar || undefined}
        onCerrar={() => setFormularioAbierto(false)}
        onAceptar={guardarTarea}
        opcionesAsignatura={opcionesRamos}
      />

      <ModalConfirmacionTareas
        abierto={modalEliminarAbierto}
        mensaje="¿Desea Confirmar la eliminación de la tarea ?"
        onConfirmar={eliminarTareasSeleccionadas}
        onDenegar={() => setModalEliminarAbierto(false)}
      />

      {/* el boton de editar se conecta con la función abrirFormularioEditar */}
      <ModalDetalleTarea
        abierto={tareaEnDetalle !== null}
        tarea={tareaEnDetalle}
        onCerrar={cerrarDetalle}
        onEditar={abrirFormularioEditar}
        onSubtareasCambiadas={recargarTareas}
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

export default Tareas;
