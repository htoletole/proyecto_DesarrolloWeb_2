import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tareas from "./pages/Tareas";
import Ramos from "./pages/Ramos";
import Calendario from "./pages/Calendario";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recover from "./pages/Recover";
import { guardarSesion, obtenerRecordado, obtenerSesion, recordarUsuario } from "./services/auth";
import type { Sesion, Usuario } from "./services/auth";

type Pantalla = "bienvenida" | "login" | "registro" | "recuperar" | "home";

// Sesión activa -> app, usuario recordado -> bienvenida, si no -> login
function pantallaInicial(): Pantalla {
  if (obtenerSesion()) return "home";
  return obtenerRecordado() ? "bienvenida" : "login";
}

// Tareas.tsx ya incluye su propio Navbar; en el resto de las rutas lo muestra App.
// Si otra página agrega su Navbar, sumar su ruta a esta lista.
const RUTAS_CON_NAVBAR_PROPIO = ["/tareas"];

function NavbarGlobal() {
  const { pathname } = useLocation();
  return RUTAS_CON_NAVBAR_PROPIO.includes(pathname) ? null : <Navbar />;
}

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>(pantallaInicial);
  const [sesion, setSesion] = useState<Sesion | null>(obtenerSesion);
  const [aviso, setAviso] = useState("");

  function entrar(usuario: Usuario, recordar = true) {
    guardarSesion(usuario);
    recordarUsuario(recordar ? usuario.username : null);
    setSesion({ id: usuario.id, username: usuario.username });
    setAviso("");
    setPantalla("home");
  }

  function cerrarSesion() {
    guardarSesion(null);
    recordarUsuario(null);
    setSesion(null);
    setAviso("Sesión cerrada");
    setPantalla("login");
  }

  function irA(destino: Pantalla) {
    setAviso("");
    setPantalla(destino);
  }

  // Con sesión iniciada se muestra la app del resto del equipo
  if (pantalla === "home" && sesion) {
    return (
      <BrowserRouter>
        <button
          type="button"
          className="btn btn-sm btn-light position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1030 }}
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

        <NavbarGlobal />

        <Routes>
          <Route path="/" element={<Dashboard username={sesion.username} />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/ramos" element={<Ramos />} />
          <Route path="/calendario" element={<Calendario />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (pantalla === "bienvenida") {
    const recordado = obtenerRecordado();
    if (recordado) {
      return (
        <Welcome usuario={recordado} onEntrar={() => entrar(recordado)} onOtroUsuario={() => irA("login")} />
      );
    }
  }

  if (pantalla === "registro") {
    return <Register onRegistrado={(u) => entrar(u, false)} onIrLogin={() => irA("login")} />;
  }

  if (pantalla === "recuperar") {
    return <Recover onRestablecida={() => irA("login")} onIrLogin={() => irA("login")} />;
  }

  return (
    <Login
      aviso={aviso}
      onLogin={entrar}
      onIrRegistro={() => irA("registro")}
      onIrRecuperar={() => irA("recuperar")}
    />
  );
}

export default App;
