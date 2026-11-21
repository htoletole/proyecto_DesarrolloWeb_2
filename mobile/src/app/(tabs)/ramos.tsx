// pestaña Ramos: los ramos del estudiante con su color. Al tocar uno se ve su avance
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { listarRamos } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { COLOR_SECCION, colorDeTexto } from "../../services/colores";
import { BotonFlotante } from "../../components/BotonFlotante";
import { useAviso } from "../../components/Aviso";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";

export default function Ramos() {
  const { datos, cargando, refrescando, error, reintentar, refrescar } = useDatos(listarRamos);
  const { elementoAviso } = useAviso();

  if (cargando) return <Cargando texto="Cargando ramos..." />;
  if (error && !datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!datos) return null;

  return (
    <View style={{ flex: 1 }}>
      {elementoAviso}
      <FlatList
        data={datos}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
        renderItem={({ item }) => {
          // el texto se pone casi negro o blanco segun el color del ramo (misma formula que la web)
          const texto = colorDeTexto(item.color);
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/ramo/[id]", params: { id: String(item.id) } })}
              style={({ pressed }) => [estilos.tarjeta, { backgroundColor: item.color }, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={"Ramo " + item.nombre}
            >
              <View style={estilos.inicial}>
                <Text style={[estilos.letra, { color: texto }]}>{item.nombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[estilos.nombre, { color: texto }]}>{item.nombre}</Text>
                <Text style={[estilos.dato, { color: texto }]}>
                  {item.codigo} · {item.modalidad}
                </Text>
                <Text style={[estilos.dato, { color: texto }]}>
                  {item.cantidadTareas} {item.cantidadTareas === 1 ? "tarea" : "tareas"} · {item.cantidadEvaluaciones}{" "}
                  {item.cantidadEvaluaciones === 1 ? "evaluación" : "evaluaciones"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={texto} />
            </Pressable>
          );
        }}
        ListEmptyComponent={<Vacio icono="school-outline" titulo="Sin ramos" texto="Crea tu primer ramo con el botón de abajo." />}
        ListFooterComponent={<View style={{ height: 80 }} />}
      />
      <BotonFlotante texto="Crear ramo" color={COLOR_SECCION.ramos} onPress={() => router.push("/ramo/formulario")} />
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    padding: 16,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  inicial: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  letra: {
    fontSize: 22,
    fontWeight: "800",
  },
  nombre: {
    fontSize: 17,
    fontWeight: "800",
  },
  dato: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
