import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderGeneral from '../components/HeaderFixed';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareasDefinitivo';
import Formulario from '../components/Formulario';
import ModalConfirmacionTareas from '../components/ModalConfirmacionTareas';
import ModalDetalleTarea from '../components/ModalDetalleTarea';
import EstadoCarga from '../components/EstadoCarga';
import Toast from '../components/Toast';
import { fechaCortaTexto } from '../services/etiquetas';
import { listarEvaluaciones } from '../services/evaluacionesApi';
import { listarRamos } from '../services/ramosApi';
import { crearTarea, datosDesdeFormulario, editarTarea, eliminarTarea, listarTareas } from '../services/tareasApi';
import type { Evaluacion, Opcion, Ramo, Tarea } from '../services/tipos';
import { useSesion } from '../services/useSesion';

import iconoInfo from '../assets/icons/info.png';
import iconoMas from '../assets/icons/mas.png';
import iconoFiltro from '../assets/icons/filtro.png';
import iconoLapiz from '../assets/icons/lapiz.png';
import '../styles/tareas.css';

function Tareas() {
  const sesion = useSesion();

  const [tipoFiltro, setTipoFiltro] = useState('normal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // datos que vienen de la API
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estados de modo selección/borrado
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<number[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // estados modales para el formulario, crear y editar
  const [tareaEnDetalle, setTareaEnDetalle] = useState<Tarea | null>(null);
  const [modoFormulario, setModoFormulario] = useState<"crear" | "editar">("crear");
  const [tareaAEditar, setTareaAEditar] = useState<Tarea | null>(null);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [enviando, setEnviando] = useState(false);

  // avisos (toast)
  const [aviso, setAviso] = useState({ mostrar: false, titulo: '', mensaje: '', error: false });

  function avisar(titulo: string, mensaje: string, esError = false) {
    setAviso({ mostrar: true, titulo, mensaje, error: esError });
  }

  // pide tareas, ramos y evaluaciones a la API
  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [listaTareas, listaRamos, listaEvaluaciones] = await Promise.all([
        listarTareas(),
        listarRamos(),
        listarEvaluaciones(),
      ]);
      setTareas(listaTareas);
      setRamos(listaRamos);
      setEvaluaciones(listaEvaluaciones);
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

  const aplicarFiltro = (filtro: string) => {
    setTipoFiltro(filtro);
    setMenuAbierto(false);
  };

  // formulario
  const abrirFormularioCrear = () => {
    setModoFormulario("crear");
    setTareaAEditar(null);
    setErrorFormulario('');
    setFormularioAbierto(true);
  };

  const abrirFormularioEditar = (tarea: Tarea) => {
    setModoFormulario("editar");
    setTareaAEditar(tarea);
    setErrorFormulario('');
    setFormularioAbierto(true);
    setTareaEnDetalle(null); //cierra el popup de detalles al abrir el formulario
  };

  const guardarTarea = async (datos: Record<string, FormDataEntryValue>) => {
    const datosTarea = datosDesdeFormulario(datos);
    setEnviando(true);
    setErrorFormulario('');

    try {
      if (modoFormulario === "crear") {
        //creacion
        const nueva = await crearTarea(datosTarea);
        setTareas([...tareas, nueva]);
        avisar('Tarea creada', '¡Tarea "' + nueva.nombre + '" creada con éxito!');
      } else if (tareaAEditar) {
        //edicion
        const editada = await editarTarea(tareaAEditar.id, datosTarea);
        reemplazarEnLista(editada);
        avisar('Tarea editada', '¡La tarea "' + editada.nombre + '" se editó con éxito!');
      }
      setFormularioAbierto(false);
      setTareaAEditar(null);
    } catch (e) {
      // por ejemplo: no se puede completar con subtareas pendientes
      setErrorFormulario((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  function reemplazarEnLista(editada: Tarea) {
    setTareas((actuales) => actuales.map((t) => (t.id === editada.id ? editada : t)));
  }

  //seccion seleccion y borrado
  const toggleModoEdicion = () => {
    setModoEdicion(!modoEdicion);
    setTareasSeleccionadas([]);
  };

  const toggleSeleccionTarea = (id: number) => {
    if (tareasSeleccionadas.includes(id)) {
      setTareasSeleccionadas(tareasSeleccionadas.filter(tId => tId !== id));
    } else {
      setTareasSeleccionadas([...tareasSeleccionadas, id]);
    }
  };

  const eliminarTareasSeleccionadas = async () => {
    setModalEliminarAbierto(false);
    try {
      await Promise.all(tareasSeleccionadas.map((id) => eliminarTarea(id)));
      setTareas(tareas.filter(tarea => !tareasSeleccionadas.includes(tarea.id)));
      avisar('Tareas eliminadas', 'Se eliminaron ' + tareasSeleccionadas.length + ' tarea(s).');
    } catch (e) {
      avisar('No se pudo eliminar', (e as Error).message, true);
      cargar();
    }
    setModoEdicion(false);
    setTareasSeleccionadas([]);
  };

  //Funciones Modal Detalles
  const abrirDetalle = (tarea: Tarea) => setTareaEnDetalle(tarea);
  const cerrarDetalle = () => setTareaEnDetalle(null);

  // cuando cambian las subtareas en el detalle
  function actualizarDesdeDetalle(tarea: Tarea) {
    reemplazarEnLista(tarea);
    setTareaEnDetalle(tarea);
  }

  const tareasFiltradas = tareas.filter(tarea =>
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // opciones de los select del formulario
  const opcionesRamos: Opcion[] = ramos.map((ramo) => ({ valor: String(ramo.id), texto: ramo.nombre }));
  const opcionesEvaluaciones: Opcion[] = evaluaciones.map((evaluacion) => ({
    valor: String(evaluacion.id),
    texto: evaluacion.nombre + ' (' + fechaCortaTexto(evaluacion.fecha) + ')',
    grupo: String(evaluacion.asignaturaId),
  }));

  // Abrir el Modal Detalles con el ID desde el link
  const [searchParams, setSearchParams] = useSearchParams();
  const tareaId = searchParams.get("id");

  useEffect(() => {
    if (tareaId) {
      const tareaPorId = tareas.find((t) => t.id === Number(tareaId));
      if (tareaPorId) {
        abrirDetalle(tareaPorId);
        setSearchParams({});
      }
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-crear" onClick={abrirFormularioCrear} disabled={ramos.length === 0}>
              Crear Tarea <img src={iconoMas} alt="Crear" className="btn-icon" />
            </button>
            {modoEdicion && tareasSeleccionadas.length > 0 && (
              <button className="btn-eliminar" onClick={() => setModalEliminarAbierto(true)}>
                Eliminar
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

            <button
              className={`btn-editar ${modoEdicion ? 'activo' : ''}`}
              onClick={toggleModoEdicion}
              title={modoEdicion ? "Cancelar edición" : "Activar edición"}>
              <img src={iconoLapiz} alt="Editar" className="btn-icon-lapiz" />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="btn-filtrar"
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                Filtrar <img src={iconoFiltro} alt="Filtrar" className="btn-icon" />
              </button>

              {menuAbierto && (
                <div className="filtro-dropdown">
                  <button onClick={() => aplicarFiltro('normal')}>Por Estado</button>
                  <button onClick={() => aplicarFiltro('prioridad')}>Por Prioridad</button>
                  <button onClick={() => aplicarFiltro('ramo')}>Por Ramo</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <EstadoCarga
          cargando={cargando}
          error={error}
          vacio={ramos.length === 0}
          mensajeVacio="Primero crea un ramo en la pestaña Ramos para poder agregar tareas."
          onReintentar={cargar}
        />

        {!cargando && error === '' && (
          <KanbanBoardTareas
            tareas={tareasFiltradas}
            ramos={ramos}
            modoEdicion={modoEdicion}
            tareasSeleccionadas={tareasSeleccionadas}
            onToggleSeleccion={toggleSeleccionTarea}
            onVerDetalle={abrirDetalle}
            filtro={tipoFiltro}
          />
        )}

      </main>

      {/* se entregan los valores iniciales si se esta editando */}
      <Formulario
        abierto={formularioAbierto}
        tipo="tarea"
        modo={modoFormulario}
        valoresIniciales={tareaAEditar ? {
          nombre: tareaAEditar.nombre,
          descripcion: tareaAEditar.descripcion,
          asignaturaId: String(tareaAEditar.asignaturaId),
          evaluacionId: tareaAEditar.evaluacionId ? String(tareaAEditar.evaluacionId) : '',
          estado: tareaAEditar.estado,
          prioridad: tareaAEditar.prioridad,
          fecha: tareaAEditar.fecha ?? '',
          horaEntrega: tareaAEditar.horaEntrega ?? '',
        } : undefined}
        onCerrar={() => setFormularioAbierto(false)}
        onAceptar={guardarTarea}
        opcionesAsignatura={opcionesRamos}
        opcionesEvaluacion={opcionesEvaluaciones}
        error={errorFormulario}
        enviando={enviando}
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
        onActualizada={actualizarDesdeDetalle}
      />

      <Toast
        mostrar={aviso.mostrar}
        titulo={aviso.titulo}
        mensaje={aviso.mensaje}
        error={aviso.error}
        onClose={() => setAviso({ ...aviso, mostrar: false })}
      />
    </div>
  );
}

export default Tareas;
