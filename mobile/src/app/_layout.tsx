// raiz de la app: sesion + navegacion. Sin sesion solo se puede ver el login
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ProveedorSesion, useSesion } from "../services/sesion";
import { Cargando } from "../components/Estados";
import { COLORES, COLOR_SECCION, colorDeTextoGrande } from "../services/colores";

// encabezado con el color de la seccion (igual que la web) y texto legible encima
function encabezado(color: string, titulo: string) {
  return {
    title: titulo,
    headerStyle: { backgroundColor: color },
    headerTintColor: colorDeTextoGrande(color),
  };
}

function Navegacion() {
  const { sesion, cargando } = useSesion();

  // mientras se lee la sesion guardada no se muestra ninguna pantalla
  if (cargando) {
    return <Cargando texto="Abriendo Syllab..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: COLORES.fondo },
      }}
    >
      <Stack.Protected guard={!!sesion}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tarea/[id]" options={encabezado(COLOR_SECCION.tareas, "Tarea")} />
        <Stack.Screen name="tarea/formulario" options={encabezado(COLOR_SECCION.tareas, "Tarea")} />
        <Stack.Screen name="ramo/[id]" options={encabezado(COLOR_SECCION.ramos, "Ramo")} />
        <Stack.Screen name="ramo/formulario" options={encabezado(COLOR_SECCION.ramos, "Ramo")} />
        <Stack.Screen name="evaluacion/formulario" options={encabezado(COLOR_SECCION.evaluaciones, "Evaluación")} />
      </Stack.Protected>
      <Stack.Protected guard={!sesion}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProveedorSesion>
      <StatusBar style="light" />
      <Navegacion />
    </ProveedorSesion>
  );
}
