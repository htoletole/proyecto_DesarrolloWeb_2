import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Recover from "../pages/Recover";
import { guardarSesion, obtenerRecordado, obtenerSesion, recordarUsuario } from "../services/auth";
import type { Sesion, Usuario } from "../services/auth";
import { registrarCerrarSesion } from "../services/authEvents";
import "../styles/login.css";

type Pantalla = "bienvenida" | "login" | "registro" | "recuperar" | "home";

// decide con que pantalla partir
function pantallaInicial(): Pantalla {
  if (obtenerSesion()) return "home";
  return obtenerRecordado() ? "bienvenida" : "login";
}

// muestra el login encima de la app, y con sesion solo deja el boton de cerrar
export default function AuthGate() {
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

  useEffect(() => {
    registrarCerrarSesion(cerrarSesion);
  }, []);

  function irA(destino: Pantalla) {
    setAviso("");
    setPantalla(destino);
  }

  if (pantalla === "home" && sesion) {
    return
  }

  const recordado = obtenerRecordado();
  let contenido: ReactNode;

  if (pantalla === "bienvenida" && recordado) {
    contenido = <Welcome usuario={recordado} onEntrar={() => entrar(recordado)} onOtroUsuario={() => irA("login")} />;
  } else if (pantalla === "registro") {
    contenido = <Register onRegistrado={(u) => entrar(u, false)} onIrLogin={() => irA("login")} />;
  } else if (pantalla === "recuperar") {
    contenido = <Recover onRestablecida={() => irA("login")} onIrLogin={() => irA("login")} />;
  } else {
    contenido = (
      <Login
        aviso={aviso}
        onLogin={entrar}
        onIrRegistro={() => irA("registro")}
        onIrRecuperar={() => irA("recuperar")}
      />
    );
  }

  return <div className="auth-overlay">{contenido}</div>;
}
