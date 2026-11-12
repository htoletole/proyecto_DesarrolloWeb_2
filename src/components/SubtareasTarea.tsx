import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  crearSubtarea,
  eliminarSubtarea,
  listarSubtareas,
  marcarSubtarea,
} from "../services/subtareasApi";
import type { Subtarea } from "../services/subtareasApi";
import "../styles/tareas.css";

interface SubtareasProps {
  tareaId: string;
  colorTema: string;
  // avisa a la pantalla que la tarea pudo cambiar de estado (la API la reabre si se agrega una subtarea)
  onCambio?: () => void;
}

// lista de subtareas dentro del detalle de una tarea
function SubtareasTarea(props: SubtareasProps) {
  const { tareaId, colorTema, onCambio } = props;

  const [subtareas, setSubtareas] = useState<Subtarea[]>([]);
  const [nueva, setNueva] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listarSubtareas(tareaId)
      .then((lista) => setSubtareas(lista))
      .catch(() => setSubtareas([]));
  }, [tareaId]);

  async function agregar(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nueva.trim() === "") return;

    try {
      const creada = await crearSubtarea(tareaId, nueva.trim());
      setSubtareas([...subtareas, creada]);
      setNueva("");
      setError("");
      onCambio?.();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function marcar(subtarea: Subtarea) {
    try {
      const editada = await marcarSubtarea(subtarea.id, !subtarea.completada);
      setSubtareas(subtareas.map((s) => (s.id === editada.id ? editada : s)));
      setError("");
      onCambio?.();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function borrar(subtarea: Subtarea) {
    try {
      await eliminarSubtarea(subtarea.id);
      setSubtareas(subtareas.filter((s) => s.id !== subtarea.id));
      setError("");
      onCambio?.();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const completadas = subtareas.filter((s) => s.completada).length;

  return (
    <div className="subtareas">
      <span className="info-box-label">
        Subtareas ({completadas}/{subtareas.length}):
      </span>

      {subtareas.length === 0 && <p className="subtareas-vacio">Sin subtareas.</p>}

      <ul className="subtareas-lista">
        {subtareas.map((subtarea) => (
          <li key={subtarea.id} className={subtarea.completada ? "hecha" : ""}>
            <label>
              <input
                type="checkbox"
                checked={subtarea.completada}
                onChange={() => marcar(subtarea)}
              />
              {subtarea.nombre}
            </label>
            <button
              type="button"
              className="subtarea-eliminar"
              aria-label={`Eliminar ${subtarea.nombre}`}
              onClick={() => borrar(subtarea)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="subtareas-form" onSubmit={agregar}>
        <input
          type="text"
          value={nueva}
          maxLength={80}
          placeholder="Nueva subtarea"
          onChange={(e) => setNueva(e.target.value)}
        />
        <button type="submit" style={{ backgroundColor: colorTema }}>
          +
        </button>
      </form>

      {error !== "" && <p className="subtareas-error">{error}</p>}
    </div>
  );
}

export default SubtareasTarea;
