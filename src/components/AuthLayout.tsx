import type { InputHTMLAttributes, ReactNode } from "react";
import "../styles/login.css";

// Contenedor común de las pantallas de acceso: fondo azul y tarjeta centrada.
export default function AuthLayout({ children, centrada = false }: { children: ReactNode; centrada?: boolean }) {
  return (
    <main className="auth-screen">
      <section className={centrada ? "auth-card auth-card-centrada" : "auth-card"}>{children}</section>
    </main>
  );
}

export function Marca({ titulo = "¡Bienvenido a Syllab!" }: { titulo?: string }) {
  return (
    <header className="marca">
      <h1>{titulo}</h1>
      <p>La agenda personal de los estudiantes</p>
    </header>
  );
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  etiqueta: string;
  ayuda?: string;
}

export function Campo({ id, etiqueta, ayuda, ...props }: CampoProps) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {ayuda && <small>{ayuda}</small>}
      <input id={id} {...props} />
    </div>
  );
}
