import { useState } from "react";
import type { SyntheticEvent } from "react";
import AuthLayout, { Campo } from "../components/AuthLayout";
import { MIN_PASSWORD, restablecerPassword } from "../services/auth";

interface Props {
  onRestablecida: () => void;
  onIrLogin: () => void;
}

export default function Recover({ onRestablecida, onIrLogin }: Props) {
  const [username, setUsername] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState("");

  function manejarSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const resultado = restablecerPassword(username, nueva, repetida);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onRestablecida();
  }

  return (
    <AuthLayout>
      <h1 className="titulo-recuperar">Restablecer Contraseña</h1>

      {error && (
        <p className="mensaje mensaje-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        <Campo
          id="rec-usuario"
          etiqueta="Nombre de Usuario (*)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <Campo
          id="rec-nueva"
          etiqueta="Nueva contraseña (*)"
          ayuda={`Te recomendamos elegir una contraseña larga (mínimo ${MIN_PASSWORD} caracteres)`}
          type="password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          autoComplete="new-password"
        />
        <Campo
          id="rec-repetida"
          etiqueta="Repetir Nueva contraseña (*)"
          type="password"
          value={repetida}
          onChange={(e) => setRepetida(e.target.value)}
          autoComplete="new-password"
        />

        <button type="submit" className="boton boton-crear">
          Restablecer
        </button>
      </form>

      <footer className="pie">
        <button type="button" className="enlace" onClick={onIrLogin}>
          Volver a ingresar
        </button>
      </footer>
    </AuthLayout>
  );
}
