import { useState } from "react";
import type { SyntheticEvent } from "react";
import AuthLayout, { Campo, Marca } from "../components/AuthLayout";
import { MIN_PASSWORD, registrar } from "../services/auth";
import type { Usuario } from "../services/auth";

interface RegisterProps {
  onRegistrado: (usuario: Usuario) => void;
  onIrLogin: () => void;
}

export default function Register(props: RegisterProps) {
  const { onRegistrado, onIrLogin } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function manejarSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const resultado = registrar(username, password);
    if (resultado.usuario === null) {
      setError(resultado.error);
      return;
    }
    onRegistrado(resultado.usuario);
  }

  return (
    <AuthLayout>
      <Marca />

      {error !== "" && (
        <p className="mensaje mensaje-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        <p className="texto-form">Crea tu cuenta</p>

        <Campo
          id="reg-usuario"
          etiqueta="Crea tu nombre de usuario:"
          valor={username}
          onCambio={setUsername}
          autoComplete="username"
        />
        <Campo
          id="reg-password"
          etiqueta="Crea tu contraseña:"
          ayuda={"Mínimo " + MIN_PASSWORD + " caracteres"}
          tipo="password"
          valor={password}
          onCambio={setPassword}
          autoComplete="new-password"
        />

        <button type="submit" className="boton boton-crear">
          Crear
        </button>
      </form>

      <footer className="pie">
        <p>
          ¿Ya tienes una cuenta?{" "}
          <button type="button" className="enlace" onClick={onIrLogin}>
            Ingresa aquí
          </button>
        </p>
      </footer>
    </AuthLayout>
  );
}
