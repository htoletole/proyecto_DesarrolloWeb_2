// pestañas de abajo: Hoy, Tareas, Ramos y Evaluaciones, cada una con el color de su seccion en la web
import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLOR_SECCION, colorDeTextoGrande } from "../../services/colores";
import { useSesion } from "../../services/sesion";

type Seccion = keyof typeof COLOR_SECCION;

export default function LayoutPestanas() {
  const { salir } = useSesion();

  // opciones de cada pestaña: encabezado y pestaña activa con el color de la seccion
  function opciones(seccion: Seccion, titulo: string, icono: keyof typeof Ionicons.glyphMap) {
    const color = COLOR_SECCION[seccion];
    const texto = colorDeTextoGrande(color);
    return {
      title: titulo,
      headerStyle: { backgroundColor: color },
      headerTintColor: texto,
      tabBarActiveTintColor: seccion === "ramos" ? "#C26A00" : color,
      tabBarIcon: ({ color: c, size }: { color: unknown; size: number }) => <Ionicons name={icono} size={size} color={c as string} />,
      // boton para cerrar sesion en el encabezado
      headerRight: () => (
        <Pressable onPress={salir} style={{ paddingHorizontal: 16 }} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
          <Ionicons name="log-out-outline" size={24} color={texto} />
        </Pressable>
      ),
    };
  }

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        tabBarInactiveTintColor: "#8A93A3",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        sceneStyle: { backgroundColor: "#F2F4FA" },
      }}
    >
      <Tabs.Screen name="index" options={opciones("hoy", "Hoy", "today-outline")} />
      <Tabs.Screen name="tareas" options={opciones("tareas", "Tareas", "checkbox-outline")} />
      <Tabs.Screen name="ramos" options={opciones("ramos", "Ramos", "school-outline")} />
      <Tabs.Screen name="evaluaciones" options={opciones("evaluaciones", "Evaluaciones", "ribbon-outline")} />
    </Tabs>
  );
}
