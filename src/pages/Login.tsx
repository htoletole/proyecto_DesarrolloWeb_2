import { useState } from "react";
import type { SyntheticEvent } from "react";
import AuthLayout, { Campo, Marca } from "../components/AuthLayout";
import { iniciarSesion } from "../services/auth";
import type { Usuario } from "../services/auth";

interface Props {
  aviso: string;
  onLogin: (usuario: Usuario, recordar: boolean) => void;
  onIrRegistro: () => void;
  onIrRecuperar: () => void;
}

export default function Login({ aviso, onLogin, onIrRegistro, onIrRecuperar }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState("");

  function manejarSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const resultado = iniciarSesion(username, password);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onLogin(resultado.usuario, recordar);
  }

  const mensaje = error || aviso;

  return (
    <AuthLayout>
      <Marca />

      {/* "Sesión cerrada" y los errores comparten el mismo lugar, como en el diseño */}
      {mensaje && (
        <p className={error ? "mensaje mensaje-error" : "mensaje"} role="alert">
          {mensaje}
        </p>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        <p className="texto-form">Ingresa a la plataforma</p>

        <Campo
          id="login-usuario"
          etiqueta="Nombre de usuario:"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <Campo
          id="login-password"
          etiqueta="Contraseña:"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
