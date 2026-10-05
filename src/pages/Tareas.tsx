import { useState, useEffect } from 'react';
import HeaderGeneral from '../components/HeaderGeneral';
import Navbar from '../components/Navbar';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareasDefinitivo';
import Formulario from '../components/Formulario';
import ModalConfirmacionTareas from '../components/ModalConfirmacionTareas';
import ModalDetalleTarea from '../components/ModalDetalleTarea';
import iconoInfo from '../assets/icons/info.png';
import iconoMas from '../assets/icons/mas.png';
import iconoFiltro from '../assets/icons/filtro.png';
import iconoLapiz from '../assets/icons/lapiz.png';
import '../styles/tareas.css';

export type Tarea = {
  id: string;
  nombre: string;
  descripcion: string;
  asignatura: string;
  estado: string;
  prioridad: string;
  horaEntrega: string;
  dia?: string;
  fecha?: string;
};

function Tareas() {
  const [tipoFiltro, setTipoFiltro] = useState('normal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  
  const [opcionesRamos, setOpcionesRamos] = useState<string[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [busqueda, setBusqueda] = useState('');

  // Estados de modo selección/borrado
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<string[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  // estados modales para el formulario, crear y editar
  const [tareaEnDetalle, setTareaEnDetalle] = useState<Tarea | null>(null);
  const [modoFormulario, setModoFormulario] = useState<"crear" | "editar">("crear");
  const [tareaAEditar, setTareaAEditar] = useState<Tarea | null>(null);

  useEffect(() => {
    const ramosGuardados = localStorage.getItem("ramos");
    if (ramosGuardados) {
      try {
        const ramosParseados = JSON.parse(ramosGuardados);
        setOpcionesRamos(ramosParseados.map((ramo: { nombre: string }) => ramo.nombre));
      } catch (error) {
        console.error("Error al cargar ramos:", error);
      }
    }

    const tareasGuardadas = localStorage.getItem("tareas");
    if (tareasGuardadas) {
      try {
        setTareas(JSON.parse(tareasGuardadas));
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      }
    }
  }, []);

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

  const guardarTarea = (datos: Record<string, FormDataEntryValue>) => {
    if (modoFormulario === "crear") {
      //creacion
      const nuevaTarea: Tarea = {
        id: Date.now().toString(),
        nombre: String(datos.nombre ?? ""),
        descripcion: String(datos.descripcion ?? ""),
        asignatura: String(datos.asignatura ?? ""),
        estado: String(datos.estado ?? "Pendiente"),
        prioridad: String(datos.prioridad ?? "Baja"),
        horaEntrega: String(datos.horaEntrega ?? ""),
        fecha: String(datos.fecha ?? ""),
      };

      const nuevasTareas = [...tareas, nuevaTarea];
      setTareas(nuevasTareas);
      localStorage.setItem("tareas", JSON.stringify(nuevasTareas));
    } 
    else if (modoFormulario === "editar" && tareaAEditar) {
      //edicion
      const tareasActualizadas = tareas.map(t => {
        if (t.id === tareaAEditar.id) {
          return {
            ...t,
            nombre: String(datos.nombre ?? ""),
            descripcion: String(datos.descripcion ?? ""),
            asignatura: String(datos.asignatura ?? ""),
            estado: String(datos.estado ?? "Pendiente"),
            prioridad: String(datos.prioridad ?? "Baja"),
            horaEntrega: String(datos.horaEntrega ?? ""),
            fecha: String(datos.fecha ?? ""),
          };
        }
        return t;
      });

      setTareas(tareasActualizadas);
      localStorage.setItem("tareas", JSON.stringify(tareasActualizadas));
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
      setTareasSeleccionadas(tareasSeleccionadas.filter(tId => tId !== id));
    } else {
      setTareasSeleccionadas([...tareasSeleccionadas, id]);
    }
  };

  const eliminarTareasSeleccionadas = () => {
    const nuevasTareas = tareas.filter(tarea => !tareasSeleccionadas.includes(tarea.id));
    setTareas(nuevasTareas);
    localStorage.setItem("tareas", JSON.stringify(nuevasTareas));
    setModalEliminarAbierto(false);
    setModoEdicion(false);
    setTareasSeleccionadas([]);
  };

//Funciones Modal Detalles
  const abrirDetalle = (tarea: Tarea) => setTareaEnDetalle(tarea);
  const cerrarDetalle = () => setTareaEnDetalle(null);

  const tareasFiltradas = tareas.filter(tarea => 
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
            <button className="btn-crear" onClick={abrirFormularioCrear}>
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
                  <button onClick={() => aplicarFiltro('dia')}>Por Día</button>
                  <button onClick={() => aplicarFiltro('ramo')}>Por Ramo</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <KanbanBoardTareas 
          tareas={tareasFiltradas} 
          ramos={opcionesRamos} 
          modoEdicion={modoEdicion} 
          tareasSeleccionadas={tareasSeleccionadas} 
          onToggleSeleccion={toggleSeleccionTarea} 
          onVerDetalle={abrirDetalle}
          filtro={tipoFiltro}
        />

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
      />
    </div>
  );
}

export default Tareas;