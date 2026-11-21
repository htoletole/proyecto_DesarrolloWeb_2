// sesion del usuario: login contra la API y token guardado en el almacenamiento seguro del celular
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { guardarToken, pedir, registrarCierreDeSesion } from "./api";

export type Sesion = {
  id: number;
  username: string;
  token: string;
};

type ValorSesion = {
  sesion: Sesion | null;
  cargando: boolean;
  entrar: (username: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
};

// asi responde la API al iniciar sesion
type RespuestaLogin = {
  token: string;
  usuario: { id: number; username: string };
};

const CLAVE = "syllab_sesion";

const ContextoSesion = createContext<ValorSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  async function salir() {
    guardarToken("");
    setSesion(null);
    await SecureStore.deleteItemAsync(CLAVE);
  }

  // al abrir la app se recupera la sesion guardada (si habia una)
  useEffect(() => {
    registrarCierreDeSesion(() => {
      salir();
    });

    SecureStore.getItemAsync(CLAVE)
      .then((texto) => {
        if (texto) {
          const guardada: Sesion = JSON.parse(texto);
          guardarToken(guardada.token);
          setSesion(guardada);
        }
      })
      .catch(() => setSesion(null))
      .finally(() => setCargando(false));
  }, []);

  async function entrar(username: string, password: string) {
    const respuesta = await pedir<RespuestaLogin>("/auth/login", "POST", {
      username: username.trim(),
      password,
    });
    const nueva: Sesion = {
      id: respuesta.usuario.id,
      username: respuesta.usuario.username,
      token: respuesta.token,
    };
    guardarToken(nueva.token);
    await SecureStore.setItemAsync(CLAVE, JSON.stringify(nueva));
    setSesion(nueva);
  }

  return (
    <ContextoSesion.Provider value={{ sesion, cargando, entrar, salir }}>
      {children}
    </ContextoSesion.Provider>
  );
}

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);
  if (!valor) {
    throw new Error("useSesion debe usarse dentro de ProveedorSesion");
  }
  return valor;
}
