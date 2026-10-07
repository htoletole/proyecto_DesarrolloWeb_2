import { useState } from "react";
import type { SyntheticEvent } from "react";
import AuthLayout, { Campo } from "../components/AuthLayout";
import { MIN_PASSWORD, restablecerPassword } from "../services/auth";

interface RecoverProps {
  onRestablecida: () => void;
  onIrLogin: () => void;
}

export default function Recover(props: RecoverProps) {
  const { onRestablecida, onIrLogin } = props;

  const [username, setUsername] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState("");

  function manejarSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const resultado = restablecerPassword(username, nueva, repetida);
    if (resultado.usuario === null) {
      setError(resultado.error);
      return;
    }
    onRestablecida();
  }

  return (
    <AuthLayout>
      <h1 className="titulo-recuperar">Restablecer Contraseña</h1>

      {error !== "" && (
        <p className="mensaje mensaje-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        <Campo
          id="rec-usuario"
          etiqueta="Nombre de Usuario (*)"
          valor={username}
          onCambio={setUsername}
          autoComplete="username"
        />
        <Campo
          id="rec-nueva"
          etiqueta="Nueva contraseña (*)"
          ayuda={"Te recomendamos elegir una contraseña larga (mínimo " + MIN_PASSWORD + " caracteres)"}
          tipo="password"
          valor={nueva}
          onCambio={setNueva}
          autoComplete="new-password"
        />
        <Campo
          id="rec-repetida"
          etiqueta="Repetir Nueva contraseña (*)"
          tipo="password"
          valor={repetida}
          onCambio={setRepetida}
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
