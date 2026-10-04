import iconoUsuario from '../assets/images/usuario.png';

const HeaderRamos = () => {
  return (
    <header className="header-ramos">
      <h1>Panel de Ramos</h1>

      <button
        className="btn p-0 rounded-circle bg-dark d-flex align-items-center justify-content-center"
        style={{
          width: '45px',
          height: '45px',
          overflow: 'hidden',
          border: 'none',
        }}
      >
        <img
          src={iconoUsuario}
          alt="Perfil de usuario"
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
      </button>
    </header>
  );
};

export default HeaderRamos;