// pestaña Evaluaciones: las proximas evaluaciones, de la mas cercana a la mas lejana
import { useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { listarEvaluaciones } from "../../services/agenda";
import type { Evaluacion } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { router } from "expo-router";
import { COLORES, COLOR_SECCION } from "../../services/colores";
import { BotonFlotante } from "../../components/BotonFlotante";
import { useAviso } from "../../components/Aviso";
import { diasHasta, hoy } from "../../services/fechas";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { TarjetaEvaluacion } from "../../components/Tarjetas";

type Vista = "proximas" | "pasadas";

export default function Evaluaciones() {
  // se piden todas y se separan aca: las proximas (desde hoy) y las que ya pasaron
  const { datos, cargando, refrescando, error, reintentar, refrescar } = useDatos(() => listarEvaluaciones());
  const [vista, setVista] = useState<Vista>("proximas");
  const { elementoAviso } = useAviso();

  if (cargando) return <Cargando texto="Cargando evaluaciones..." />;
  if (error && !datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!datos) return null;

  const fechaHoy = hoy();
  const proximas = datos.filter((e) => e.fecha >= fechaHoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const pasadas = datos.filter((e) => e.fecha < fechaHoy).sort((a, b) => b.fecha.localeCompare(a.fecha));

  // las proximas se agrupan por cercania para ver rapido que viene
  let secciones: { title: string; data: Evaluacion[] }[];
  if (vista === "proximas") {
    secciones = [
      { title: "Esta semana", data: proximas.filter((e) => diasHasta(e.fecha) <= 7) },
      { title: "Más adelante", data: proximas.filter((e) => diasHasta(e.fecha) > 7) },
    ].filter((s) => s.data.length > 0);
  } else {
    secciones = pasadas.length > 0 ? [{ title: "Ya pasaron", data: pasadas }] : [];
  }

  return (
    <View style={{ flex: 1 }}>
      {elementoAviso}
      <View style={estilos.selector}>
        {(["proximas", "pasadas"] as Vista[]).map((v) => {
          const activo = vista === v;
          return (
            <Pressable
              key={v}
              onPress={() => setVista(v)}
              style={[estilos.opcion, activo && estilos.opcionActiva]}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
            >
              <Text style={[estilos.textoOpcion, activo && { color: "#FFFFFF" }]}>
                {v === "proximas" ? "Próximas (" + proximas.length + ")" : "Pasadas (" + pasadas.length + ")"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        sections={secciones}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
        renderSectionHeader={({ section }) => <Text style={estilos.seccion}>{section.title}</Text>}
        renderItem={({ item }) => (
          <TarjetaEvaluacion
            evaluacion={item}
            onPress={() => router.push({ pathname: "/evaluacion/formulario", params: { id: String(item.id) } })}
          />
        )}
        ListFooterComponent={<View style={{ height: 80 }} />}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Vacio
            icono="ribbon-outline"
            titulo={vista === "proximas" ? "Sin evaluaciones próximas" : "Aún no hay evaluaciones pasadas"}
            texto={vista === "proximas" ? "¡Aprovecha para adelantar tareas!" : undefined}
          />
        }
      />
      <BotonFlotante texto="Crear evaluación" color={COLOR_SECCION.evaluaciones} onPress={() => router.push("/evaluacion/formulario")} />
    </View>
  );
}

const estilos = StyleSheet.create({
  selector: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 4,
    backgroundColor: COLORES.moradoClaro,
    borderRadius: 22,
    padding: 4,
  },
  opcion: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: "center",
  },
  opcionActiva: {
    backgroundColor: COLORES.morado,
  },
  textoOpcion: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORES.morado,
  },
  lista: {
    padding: 16,
  },
  seccion: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORES.texto,
    marginBottom: 10,
    marginTop: 6,
  },
});
