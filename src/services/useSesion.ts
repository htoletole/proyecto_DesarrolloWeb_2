import { useEffect, useState } from "react";
import { EVENTO_SESION, obtenerSesion } from "./auth";
import type { Sesion } from "./auth";

// devuelve quien tiene la sesion iniciada, y se actualiza cuando entra o sale alguien
export function useSesion(): Sesion | null {
  const [sesion, setSesion] = useState<Sesion | null>(obtenerSesion);

  useEffect(() => {
    function actualizar() {
      setSesion(obtenerSesion());
    }

    window.addEventListener(EVENTO_SESION, actualizar);

    return () => {
      window.removeEventListener(EVENTO_SESION, actualizar);
    };
  }, []);

  return sesion;
}
