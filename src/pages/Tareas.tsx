import { useState, useEffect } from 'react';
import HeaderTareas from '../components/HeaderTareas';
import Navbar from '../components/Navbar';
import SearchBarTareas from '../components/SearchBarTareas';
import KanbanBoardTareas from '../components/KanbanBoardTareas';
import KanbanBoardTareasFiltro from '../components/KanbanBoardTareasFiltro';
import KanbanBoardTareasFiltroDia from '../components/KanbanBoardTareasFiltroDia';
import KanbarBoardTareasFiltroRamo from '../components/KanbanBoardTareasFiltroRamo';
import Formulario from '../components/Formulario';
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
};

function Tareas() {
  const [tipoFiltro, setTipoFiltro] = useState('normal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  
  const [opcionesRamos, setOpcionesRamos] = useState<string[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  
  // Nuevo estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('');

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

  const tareasFiltradas = tareas.filter(tarea => 
    tarea.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-vh-100 w-100 page-container">
      <HeaderTareas />
      
      <main className="content-container">
        {/* Pasamos el estado de búsqueda a la barra */}
        <SearchBarTareas busqueda={busqueda} setBusqueda={setBusqueda} />

        <div className="info-banner">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Presiona una tarea para ver mas informacion sobre esta.</p>
        </div>

        <div className="action-buttons-container">
          <button className="btn-crear" onClick={() => setFormularioAbierto(true)}>
            Crear Tarea <img src={iconoMas} alt="Crear" className="btn-icon" />
          </button>
        
          {/* Contenedor Flexbox agrupando ambos botones a la derecha */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            
            <button className="btn-editar" onClick={() => console.log('Botón editar presionado')}>
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

        {/* Le entregamos 'tareasFiltradas' a los tableros en lugar de 'tareas' */}
        {tipoFiltro === 'normal' && <KanbanBoardTareas tareas={tareasFiltradas} />}
        {tipoFiltro === 'prioridad' && <KanbanBoardTareasFiltro tareas={tareasFiltradas} />}
        {tipoFiltro === 'dia' && <KanbanBoardTareasFiltroDia tareas={tareasFiltradas} />}
        {tipoFiltro === 'ramo' && <KanbarBoardTareasFiltroRamo tareas={tareasFiltradas} ramos={opcionesRamos} />}

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
    </div>
  );
}

export default Tareas;