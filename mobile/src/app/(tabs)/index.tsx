// pestaña Hoy: agenda diaria. Se elige un dia de la semana y se ven sus tareas y evaluaciones
import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { listarEvaluaciones, listarTareas } from "../../services/agenda";
import type { Evaluacion, Tarea } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { useSesion } from "../../services/sesion";
import { COLORES } from "../../services/colores";
import { fechaConAnio, hoy, nombreDia, numeroDia, semanaDe, sumarDias } from "../../services/fechas";
import { Cargando, ErrorCarga, Vacio } from "../../components/Estados";
import { TarjetaEvaluacion, TarjetaTarea } from "../../components/Tarjetas";

type DatosAgenda = { tareas: Tarea[]; evaluaciones: Evaluacion[] };

// bloque con barra de titulo de color, igual a los bloques de estados del inicio de la web
function Bloque({ titulo, fondo, texto, cantidad, children }: { titulo: string; fondo: string; texto: string; cantidad: number; children: ReactNode }) {
  return (
    <View style={estilos.bloque}>
      <View style={[estilos.barraBloque, { backgroundColor: fondo }]}>
        <Text style={[estilos.tituloBloque, { color: texto }]}>{titulo}</Text>
        <Text style={[estilos.cuentaBloque, { color: texto }]}>{cantidad}</Text>
      </View>
      <View style={estilos.cuerpoBloque}>{children}</View>
    </View>
  );
}

async function pedirAgenda(): Promise<DatosAgenda> {
  const [tareas, evaluaciones] = await Promise.all([listarTareas(), listarEvaluaciones()]);
  return { tareas, evaluaciones };
}

export default function Hoy() {
  const { sesion } = useSesion();
  const { datos, cargando, refrescando, error, reintentar, refrescar } = useDatos(pedirAgenda);
  const fechaHoy = hoy();
  const [seleccionado, setSeleccionado] = useState(fechaHoy);

  if (cargando) return <Cargando texto="Cargando tu agenda..." />;
  if (error && !datos) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!datos) return null;

  const semana = semanaDe(seleccionado);
  const tareasDelDia = datos.tareas.filter((t) => t.fecha === seleccionado);
  const evaluacionesDelDia = datos.evaluaciones.filter((e) => e.fecha === seleccionado);
  // lo atrasado se muestra solo en el dia de hoy, para no repetirlo en cada dia
  const vencidas = datos.tareas.filter((t) => t.estado !== "COMPLETADA" && t.fecha !== "" && t.fecha < fechaHoy);
  const pendientesHoy = datos.tareas.filter((t) => t.fecha === fechaHoy && t.estado !== "COMPLETADA").length;

  // un punto debajo del dia si ese dia tiene algo
  function tieneAlgo(fecha: string) {
    return datos!.tareas.some((t) => t.fecha === fecha) || datos!.evaluaciones.some((e) => e.fecha === fecha);
  }

  const abrirTarea = (tarea: Tarea) => router.push({ pathname: "/tarea/[id]", params: { id: String(tarea.id) } });

  return (
    <ScrollView
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}
    >
      {/* saludo con el estilo del encabezado del inicio de la web */}
      <View style={estilos.saludoCaja}>
        <Text style={estilos.saludo}>
          ¡Hola, <Text style={{ color: "#59B7FF" }}>{sesion?.username}</Text>!
        </Text>
        <Text style={estilos.resumen}>
        {pendientesHoy === 0 ? "No tienes tareas pendientes para hoy" : "Tienes " + pendientesHoy + (pendientesHoy === 1 ? " tarea" : " tareas") + " para hoy"}
          {vencidas.length > 0 ? " y " + vencidas.length + (vencidas.length === 1 ? " atrasada" : " atrasadas") : ""}
        </Text>
      </View>

      {/* tira de la semana: flechas para cambiar de semana y un boton por dia */}
      <View style={estilos.semana}>
        <View style={estilos.filaSemana}>
          <Pressable onPress={() => setSeleccionado(sumarDias(seleccionado, -7))} style={estilos.flecha} accessibilityLabel="Semana anterior">
            <Ionicons name="chevron-back" size={22} color={COLORES.azul} />
          </Pressable>
          <Text style={estilos.mes}>{fechaConAnio(seleccionado)}</Text>
          <Pressable onPress={() => setSeleccionado(sumarDias(seleccionado, 7))} style={estilos.flecha} accessibilityLabel="Semana siguiente">
            <Ionicons name="chevron-forward" size={22} color={COLORES.azul} />
          </Pressable>
        </View>
        <View style={estilos.dias}>
          {semana.map((fecha) => {
            const elegido = fecha === seleccionado;
            const esHoy = fecha === fechaHoy;
            return (
              <Pressable
                key={fecha}
                onPress={() => setSeleccionado(fecha)}
                style={[estilos.dia, elegido && estilos.diaElegido, !elegido && esHoy && estilos.diaHoy]}
                accessibilityRole="button"
                accessibilityState={{ selected: elegido }}
                accessibilityLabel={nombreDia(fecha) + " " + numeroDia(fecha)}
              >
                <Text style={[estilos.nombreDia, elegido && { color: "#FFFFFF" }]}>{nombreDia(fecha)}</Text>
                <Text style={[estilos.numeroDia, elegido && { color: "#FFFFFF" }]}>{numeroDia(fecha)}</Text>
                <View style={[estilos.punto, { backgroundColor: tieneAlgo(fecha) ? (elegido ? "#FFFFFF" : COLORES.naranjo) : "transparent" }]} />
              </Pressable>
            );
          })}
        </View>
        {seleccionado !== fechaHoy ? (
          <Pressable onPress={() => setSeleccionado(fechaHoy)} style={estilos.volverHoy}>
            <Text style={estilos.textoVolverHoy}>Volver a hoy</Text>
          </Pressable>
        ) : null}
      </View>

      {/* mismos colores que la web: vencidas casi negro, evaluaciones morado, tareas por estado */}
      {seleccionado === fechaHoy && vencidas.length > 0 ? (
        <Bloque titulo="Vencidas" fondo="#3A3A40" texto="#F2F2F4" cantidad={vencidas.length}>
          {vencidas.map((t) => (
            <TarjetaTarea key={t.id} tarea={t} onPress={() => abrirTarea(t)} />
          ))}
        </Bloque>
      ) : null}

      <Bloque titulo="Evaluaciones del día" fondo="#CDBAF5" texto="#5B3FB0" cantidad={evaluacionesDelDia.length}>
        {evaluacionesDelDia.length === 0 ? (
          <Text style={estilos.nada}>No hay evaluaciones este día.</Text>
        ) : (
          evaluacionesDelDia.map((e) => (
            <TarjetaEvaluacion
              key={e.id}
              evaluacion={e}
              onPress={() => router.push({ pathname: "/evaluacion/formulario", params: { id: String(e.id) } })}
            />
          ))
        )}
      </Bloque>

      <Bloque titulo="Tareas del día" fondo={COLORES.azul} texto="#FFFFFF" cantidad={tareasDelDia.length}>
        {tareasDelDia.length === 0 ? (
          <Vacio icono="sunny-outline" titulo="Día libre" texto="No hay tareas con entrega este día." />
        ) : (
          tareasDelDia.map((t) => <TarjetaTarea key={t.id} tarea={t} onPress={() => abrirTarea(t)} mostrarFecha={false} />)
        )}
      </Bloque>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  saludoCaja: {
    backgroundColor: COLORES.azul,
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
  },
  saludo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  resumen: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  bloque: {
    backgroundColor: "#F2F4FA",
    borderRadius: 15,
    marginTop: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  barraBloque: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tituloBloque: {
    fontSize: 19,
    fontWeight: "800",
  },
  cuentaBloque: {
    fontSize: 16,
    fontWeight: "800",
  },
  cuerpoBloque: {
    padding: 10,
    paddingBottom: 2,
  },
  semana: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 8,
  },
  filaSemana: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  flecha: {
    padding: 6,
  },
  mes: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.azul,
  },
  dias: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dia: {
    width: 42,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  diaElegido: {
    backgroundColor: COLORES.azul,
  },
  diaHoy: {
    backgroundColor: COLORES.azulClaro,
  },
  nombreDia: {
    fontSize: 12,
    color: COLORES.textoSuave,
    fontWeight: "600",
  },
  numeroDia: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.texto,
    marginTop: 2,
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  volverHoy: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  textoVolverHoy: {
    color: COLORES.azul,
    fontWeight: "700",
  },
  seccion: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.texto,
    marginTop: 18,
    marginBottom: 10,
  },
  nada: {
    fontSize: 14,
    color: COLORES.textoSuave,
    marginBottom: 10,
    marginLeft: 4,
  },
});
