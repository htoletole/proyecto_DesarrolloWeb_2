import React from 'react';
import iconoLupa from '../assets/icons/lupa.png';

const SearchBarTareas = () => {
  return (
    <div className="search-bar">
      <input type="text" placeholder="Buscar tarea por nombre ..." />
      <button className="search-icon">
        <img src={iconoLupa} alt="Buscar" />
      </button>
    </div>
  );
};

export default SearchBarTareas;