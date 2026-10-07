import type { ReactNode } from "react";
import "../styles/login.css";

// marco azul con la tarjeta

interface AuthLayoutProps {
  children: ReactNode;
  centrada?: boolean;
}

export default function AuthLayout({ children, centrada }: AuthLayoutProps) {
  let claseTarjeta = "auth-card";
  if (centrada) {
    claseTarjeta = "auth-card auth-card-centrada";
  }

  return (
    <main className="auth-screen">
      <section className={claseTarjeta}>{children}</section>
    </main>
  );
}

// titulo y subtitulo

interface MarcaProps {
  titulo?: string;
}

export function Marca({ titulo = "¡Bienvenido a Syllab!" }: MarcaProps) {
  return (
    <header className="marca">
      <h1>{titulo}</h1>
      <p>La agenda personal de los estudiantes</p>
    </header>
  );
}

// etiqueta, ayuda y cuadro de texto

interface CampoProps {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: string;
  ayuda?: string;
  autoComplete?: string;
}

export function Campo(props: CampoProps) {
  const { id, etiqueta, valor, onCambio, tipo = "text", ayuda, autoComplete } = props;

  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {ayuda && <small>{ayuda}</small>}
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        autoComplete={autoComplete}
      />
    </div>
  );
}
