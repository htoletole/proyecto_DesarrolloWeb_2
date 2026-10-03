import profilePicture from "../assets/images/usuario.png";

interface HeaderProps {
  username: string;
}

function HeaderDashboard(props: HeaderProps) {
  const { username } = props;

  const fecha = new Date();

  const fechaString = fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="">
      <div className="container-fluid header-dashboard">
        <div className="row g-0">
          <div className="col-8 p-0">
            <h1>
              ¡Hola, <span className="username">{username}</span>!
            </h1>
            <p>Hoy es {fechaString}</p>
          </div>
          <div className="col-4 p-0 d-flex align-items-center justify-content-end">
            <img src={profilePicture} alt="Profile picture" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderDashboard;
