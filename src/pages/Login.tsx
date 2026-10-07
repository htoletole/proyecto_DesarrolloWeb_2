import { useState } from "react";
import type { SyntheticEvent } from "react";
import AuthLayout, { Campo, Marca } from "../components/AuthLayout";
import { iniciarSesion } from "../services/auth";
import type { Usuario } from "../services/auth";

interface LoginProps {
  aviso: string;
  onLogin: (usuario: Usuario, recordar: boolean) => void;
  onIrRegistro: () => void;
  onIrRecuperar: () => void;
}

export default function Login(props: LoginProps) {
  const { aviso, onLogin, onIrRegistro, onIrRecuperar } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState("");

  function manejarSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const resultado = iniciarSesion(username, password);
    if (resultado.usuario === null) {
      setError(resultado.error);
      return;
    }
    onLogin(resultado.usuario, recordar);
  }

  // el error y el aviso van en el mismo lugar
  let mensaje = aviso;
  let claseMensaje = "mensaje";
  if (error !== "") {
    mensaje = error;
    claseMensaje = "mensaje mensaje-error";
  }

  return (
    <AuthLayout>
      <Marca />

      {mensaje !== "" && (
        <p className={claseMensaje} role="alert">
          {mensaje}
        </p>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        <p className="texto-form">Ingresa a la plataforma</p>

        <Campo
          id="login-usuario"
          etiqueta="Nombre de usuario:"
          valor={username}
          onCambio={setUsername}
          autoComplete="username"
        />
        <Campo
          id="login-password"
          etiqueta="Contraseña:"
          tipo="password"
          valor={password}
          onCambio={setPassword}
          autoComplete="current-password"
        />

        <label className="check">
          <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
          Recordarme en este dispositivo
        </label>

        <button type="submit" className="boton">
          Ingresar
        </button>
      </form>

      <footer className="pie">
        <p>
          ¿No tienes una cuenta?{" "}
          <button type="button" className="enlace" onClick={onIrRegistro}>
            Regístrate aquí
          </button>
        </p>
        <button type="button" className="enlace" onClick={onIrRecuperar}>
          ¿Olvidaste tu contraseña?
        </button>
      </footer>
    </AuthLayout>
  );
}
