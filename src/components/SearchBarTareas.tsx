import iconoLupa from '../assets/icons/lupa.png';

interface SearchBarProps {
  busqueda: string;
  setBusqueda: (valor: string) => void;
}

const SearchBarTareas = ({ busqueda, setBusqueda }: SearchBarProps) => {
  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Buscar tarea por nombre ..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button className="search-icon">
        <img src={iconoLupa} alt="Buscar" />
      </button>
    </div>
  );
};

export default SearchBarTareas;