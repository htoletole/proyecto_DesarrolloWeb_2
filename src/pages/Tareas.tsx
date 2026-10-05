import { useState, useEffect } from 'react';
import HeaderTareas from '../components/HeaderTareas';
import Navbar from '../components/Navbar';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareas';
import KanbanBoardTareasFiltro from '../components/KanbanBoardTareasFiltro';
import KanbanBoardTareasFiltroDia from '../components/KanbanBoardTareasFiltroDia';
import KanbarBoardTareasFiltroRamo from '../components/KanbanBoardTareasFiltroRamo';
import Formulario from '../components/Formulario';
import ModalConfirmacionTareas from '../components/ModalConfirmacionTareas';
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
};

function Tareas() {
  const [tipoFiltro, setTipoFiltro] = useState('normal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [opcionesRamos, setOpcionesRamos] = useState<string[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [busqueda, setBusqueda] = useState('');

  //estados de lapiz
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<string[]>([]);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

  useEffect(() => {
    const ramosGuardados = localStorage.getItem("ramos");
    if (ramosGuardados) {
      try {
        setOpcionesRamos(JSON.parse(ramosGuardados).map((ramo: { nombre: string }) => ramo.nombre));
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

  const crearTarea = (datos: Record<string, FormDataEntryValue>) => {
    const nuevaTarea: Tarea = {
      id: Date.now().toString(),
      nombre: String(datos.nombre ?? ""),
      descripcion: String(datos.descripcion ?? ""),
      asignatura: String(datos.asignatura ?? ""),
      estado: String(datos.estado ?? "Pendiente"),
      prioridad: String(datos.prioridad ?? "Baja"),
      horaEntrega: String(datos.horaEntrega ?? ""),
    };

    const nuevasTareas = [...tareas, nuevaTarea];
    setTareas(nuevasTareas);
    localStorage.setItem("tareas", JSON.stringify(nuevasTareas));
    setFormularioAbierto(false);
  };

  //modo seleccion y borrado
  const toggleModoEdicion = () => {
    setModoEdicion(!modoEdicion);
    setTareasSeleccionadas([]); //limpia la seleccion
  }

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

  const tareasFiltradas = tareas.filter(tarea => 
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-vh-100 w-100 page-container">
      <HeaderTareas />
      
      <main className="content-container">
        <SearchBarTareas busqueda={busqueda} setBusqueda={setBusqueda} />

        <div className="info-banner">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona una tarea para ver mas informacion sobre esta.</p>
        </div>

        <div className="action-buttons-container">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-crear" onClick={() => setFormularioAbierto(true)}>
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
              <button className="btn-filtrar" onClick={() => setMenuAbierto(!menuAbierto)}>
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

        {tipoFiltro === 'normal' && <KanbanBoardTareas tareas={tareasFiltradas} modoEdicion={modoEdicion} tareasSeleccionadas={tareasSeleccionadas} onToggleSeleccion={toggleSeleccionTarea} />}
        {tipoFiltro === 'prioridad' && <KanbanBoardTareasFiltro tareas={tareasFiltradas} modoEdicion={modoEdicion} tareasSeleccionadas={tareasSeleccionadas} onToggleSeleccion={toggleSeleccionTarea} />}
        {tipoFiltro === 'dia' && <KanbanBoardTareasFiltroDia tareas={tareasFiltradas} modoEdicion={modoEdicion} tareasSeleccionadas={tareasSeleccionadas} onToggleSeleccion={toggleSeleccionTarea} />}
        {tipoFiltro === 'ramo' && <KanbarBoardTareasFiltroRamo tareas={tareasFiltradas} ramos={opcionesRamos} modoEdicion={modoEdicion} tareasSeleccionadas={tareasSeleccionadas} onToggleSeleccion={toggleSeleccionTarea} />}

      </main>

      <Navbar />

      <Formulario 
        abierto={formularioAbierto}
        tipo="tarea"
        modo="crear"
        onCerrar={() => setFormularioAbierto(false)}
        onAceptar={crearTarea}
        opcionesAsignatura={opcionesRamos}
      />

      <ModalConfirmacionTareas 
        abierto={modalEliminarAbierto}
        mensaje="¿Desea Confirmar la eliminación de la tarea ?"
        onConfirmar={eliminarTareasSeleccionadas}
        onDenegar={() => setModalEliminarAbierto(false)}
      />
    </div>
  );
}

export default Tareas;