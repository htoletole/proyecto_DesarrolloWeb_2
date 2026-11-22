// pestaña Tareas: buscador + filtro "por estado / por prioridad / por ramo" (igual que la web)
// y boton para crear. Al tocar una tarea se abre su detalle, donde se cambia el estado rapido
import { useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ESTADOS, listarRamos, listarTareas, PRIORIDADES_LISTA } from "../../services/agenda";
import type { Ramo, Tarea } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { COLORES, COLOR_SECCION, colorDeTextoGrande } from "../../services/colores";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { TarjetaTarea } from "../../components/Tarjetas";
import { BotonFlotante } from "../../components/BotonFlotante";
import { useAviso } from "../../components/Aviso";

type Filtro = "estado" | "prioridad" | "ramo";

const VERDE = COLOR_SECCION.tareas;

const ICONOS_ESTADO: Record<string, keyof typeof Ionicons.glyphMap> = {
  PENDIENTE: "time-outline",
  EN_PROGRESO: "bar-chart",
  COMPLETADA: "checkmark-circle-outline",
};

const ICONOS_PRIORIDAD: Record<string, keyof typeof Ionicons.glyphMap> = {
  BAJA: "arrow-down-circle-outline",
  MEDIA: "remove-circle-outline",
  ALTA: "arrow-up-circle-outline",
  URGENTE: "alert-circle-outline",
};

type Seccion = { title: string; color: string; icono?: keyof typeof Ionicons.glyphMap; data: Tarea[] };

async function pedirDatos(): Promise<{ tareas: Tarea[]; ramos: Ramo[] }> {
  const [tareas, ramos] = await Promise.all([listarTareas(), listarRamos()]);
  return { tareas, ramos };
}

// dentro de cada grupo: primero la fecha mas cercana, al final las sin fecha
function ordenar(tareas: Tarea[]): Tarea[] {
  return [...tareas].sort((a, b) => {
    if (a.fecha === "") return 1;
    if (b.fecha === "") return -1;
    return a.fecha.localeCompare(b.fecha);
  });
}

export default function Tareas() {
  const { datos, cargando, refrescando, error, reintentar, refrescar } = useDatos(pedirDatos);
  const { elementoAviso } = useAviso();
  const [filtro, setFiltro] = useState<Filtro>("estado");
  const [busqueda, setBusqueda] = useState("");

  if (cargando) return <Cargando texto="Cargando tareas..." />;
  if (error && !datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!datos) return null;

  // buscador por nombre (como la barra de busqueda de la web)
  const texto = busqueda.trim().toLowerCase();
  const filtradas = ordenar(datos.tareas.filter((t) => t.nombre.toLowerCase().includes(texto)));

  let secciones: Seccion[];
  if (filtro === "estado") {
    secciones = ESTADOS.map((e) => ({
      title: e.texto,
      color: VERDE,
      icono: ICONOS_ESTADO[e.valor],
      data: filtradas.filter((t) => t.estado === e.valor),
    }));
  } else if (filtro === "prioridad") {
    secciones = PRIORIDADES_LISTA.map((p) => ({
      title: p.texto,
      color: VERDE,
      icono: ICONOS_PRIORIDAD[p.valor],
      data: filtradas.filter((t) => t.prioridad === p.valor),
    }));
  } else {
    // por ramo: el encabezado toma el color del ramo (igual que en la web)
    secciones = datos.ramos.map((r) => ({
      title: r.nombre,
      color: r.color,
      data: filtradas.filter((t) => t.ramo.id === r.id),
    }));
  }

  const filtros: { valor: Filtro; texto: string }[] = [
    { valor: "estado", texto: "Por estado" },
    { valor: "prioridad", texto: "Por prioridad" },
    { valor: "ramo", texto: "Por ramo" },
  ];

  return (
    <View style={{ flex: 1 }}>
      {elementoAviso}
      <View style={estilos.cabecera}>
        <View style={estilos.buscador}>
          <TextInput
            style={estilos.campoBuscar}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar tarea por nombre..."
            placeholderTextColor="#9AA1AC"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <Ionicons name="search" size={20} color={COLORES.texto} />
        </View>
        <View style={estilos.filtros}>
          <Ionicons name="filter" size={18} color={VERDE} />
          {filtros.map((f) => {
            const activo = filtro === f.valor;
            return (
              <Pressable
                key={f.valor}
                onPress={() => setFiltro(f.valor)}
                style={[estilos.filtro, activo && estilos.filtroActivo]}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Text style={[estilos.textoFiltro, activo && { color: "#FFFFFF" }]}>{f.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={secciones}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={estilos.lista}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
        renderSectionHeader={({ section }) => (
          <View style={[estilos.encabezado, { backgroundColor: section.color }]}>
            <Text style={[estilos.textoEncabezado, { color: colorDeTextoGrande(section.color) }]}>{section.title}</Text>
            {section.icono ? <Ionicons name={section.icono} size={18} color={colorDeTextoGrande(section.color)} /> : null}
            <Text style={[estilos.cuenta, { color: colorDeTextoGrande(section.color) }]}>{section.data.length}</Text>
          </View>
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? <Text style={estilos.sinTareas}>Sin tareas</Text> : null
        }
        renderItem={({ item }) => (
          <TarjetaTarea
            tarea={item}
            estilo="ramo"
            onPress={() => router.push({ pathname: "/tarea/[id]", params: { id: String(item.id) } })}
          />
        )}
        ListEmptyComponent={<Vacio icono="checkmark-done-outline" titulo="Sin tareas" texto="Crea tu primera tarea con el botón de abajo." />}
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      <BotonFlotante texto="Crear tarea" color={VERDE} onPress={() => router.push("/tarea/formulario")} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9ECEF",
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  campoBuscar: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORES.texto,
  },
  filtros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filtro: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: VERDE,
    backgroundColor: COLORES.tarjeta,
  },
  filtroActivo: {
    backgroundColor: VERDE,
  },
  textoFiltro: {
    fontSize: 13,
    fontWeight: "700",
    color: VERDE,
  },
  lista: {
    padding: 16,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  textoEncabezado: {
    fontSize: 18,
    fontWeight: "600",
  },
  cuenta: {
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.85,
  },
  sinTareas: {
    color: COLORES.textoSuave,
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 4,
  },
});
