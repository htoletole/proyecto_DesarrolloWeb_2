import AuthLayout, { Marca } from "../components/AuthLayout";
import type { Usuario } from "../services/auth";

interface Props {
  usuario: Usuario;
  onEntrar: () => void;
  onOtroUsuario: () => void;
}

// Pantalla para el usuario recordado: un clic en el avatar entra directo.
export default function Welcome({ usuario, onEntrar, onOtroUsuario }: Props) {
  return (
    <AuthLayout centrada>
      <Marca titulo={`¡Bienvenido a ${usuario.username}!`} />

      <button type="button" className="avatar-btn" onClick={onEntrar} aria-label={`Entrar como ${usuario.username}`}>
        <span className="avatar">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="34" r="16" fill="none" stroke="#111" strokeWidth="3" />
            <path
              d="M18 88 V78 a14 14 0 0 1 14 -14 h36 a14 14 0 0 1 14 14 V88 Z"
              fill="none"
              stroke="#111"
              strokeWidth="3"
            />
          </svg>
        </span>
        <span className="avatar-nombre">{usuario.username}</span>
      </button>

      <button type="button" className="enlace enlace-pie" onClick={onOtroUsuario}>
        Ingresar otro usuario
      </button>
    </AuthLayout>
  );
}
