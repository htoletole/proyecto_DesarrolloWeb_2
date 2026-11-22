// crear o editar una evaluacion (nombre, ramo, tipo, fecha, ponderacion y nota, como en la web)
// /evaluacion/formulario             -> crear
// /evaluacion/formulario?ramoId=2    -> crear con el ramo ya elegido
// /evaluacion/formulario?id=7        -> editar (por ejemplo, poner la nota)
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  crearEvaluacion,
  editarEvaluacion,
  eliminarEvaluacion,
  listarEvaluaciones,
  listarRamos,
  TIPOS_LISTA,
} from "../../services/agenda";
import type { Ramo } from "../../services/agenda";
import { COLORES, COLOR_SECCION } from "../../services/colores";
import { dejarAviso } from "../../services/avisos";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useAviso } from "../../components/Aviso";
import { BotonEliminar, BotonPrincipal, Campo, Opciones, SelectorFecha } from "../../components/Formulario";

const COLOR = COLOR_SECCION.evaluaciones;

export default function FormularioEvaluacion() {
  const params = useLocalSearchParams<{ id?: string; ramoId?: string }>();
  const idEvaluacion = params.id ? Number(params.id) : 0;
  const editando = idEvaluacion > 0;
  const { elementoAviso, mostrarAviso } = useAviso();

  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  // ponderacion que ya usan las otras evaluaciones de cada ramo, para avisar antes de pasar de 100%
  const [usada, setUsada] = useState<Record<string, number>>({});

  const [nombre, setNombre] = useState("");
  const [ramoId, setRamoId] = useState(params.ramoId ?? "");
  const [tipo, setTipo] = useState("");
  const [fecha, setFecha] = useState("");
  const [ponderacion, setPonderacion] = useState("");
  const [nota, setNota] = useState("");

  async function cargar() {
    setCargando(true);
    setErrorCarga("");
    try {
      const [listaRamos, evaluaciones] = await Promise.all([listarRamos(), listarEvaluaciones()]);
      setRamos(listaRamos);

      const suma: Record<string, number> = {};
      for (const e of evaluaciones) {
        if (e.id === idEvaluacion) continue;
        suma[String(e.ramo.id)] = (suma[String(e.ramo.id)] ?? 0) + e.ponderacion;
      }
      setUsada(suma);

      if (editando) {
        const e = evaluaciones.find((x) => x.id === idEvaluacion);
        if (!e) throw new Error("La evaluación ya no existe.");
        setNombre(e.nombre);
        setRamoId(String(e.ramo.id));
        setTipo(e.tipo);
        setFecha(e.fecha);
        setPonderacion(String(e.ponderacion));
        setNota(e.nota !== null ? String(e.nota) : "");
      }
    } catch (e) {
      setErrorCarga((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // la nota se acepta con coma o con punto (6,5 o 6.5)
  const notaNumero = nota.trim() === "" ? null : Number(nota.replace(",", "."));
  const ponderacionNumero = Number(ponderacion);

  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    if (nombre.trim() === "") nuevos.nombre = "Escribe el nombre de la evaluación.";
    if (ramoId === "") nuevos.ramo = "Elige un ramo.";
    if (tipo === "") nuevos.tipo = "Elige el tipo.";
    if (fecha === "") nuevos.fecha = "Elige la fecha.";
    if (!Number.isInteger(ponderacionNumero) || ponderacionNumero < 1 || ponderacionNumero > 100) {
      nuevos.ponderacion = "Debe ser un número entero entre 1 y 100.";
    }
    if (notaNumero !== null && (Number.isNaN(notaNumero) || notaNumero < 1 || notaNumero > 7)) {
      nuevos.nota = "La nota va de 1.0 a 7.0.";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function guardar() {
    if (!validar()) {
      mostrarAviso("error", "Revisa los campos marcados.");
      return;
    }
    setGuardando(true);
    const datos = {
      nombre: nombre.trim(),
      tipo,
      fecha,
      ponderacion: ponderacionNumero,
      nota: notaNumero === null ? null : Math.round(notaNumero * 10) / 10,
    };
    try {
      if (editando) {
        await editarEvaluacion(idEvaluacion, datos);
        dejarAviso("exito", "¡La evaluación «" + datos.nombre + "» se modificó con éxito!");
      } else {
        await crearEvaluacion(Number(ramoId), datos);
        dejarAviso("exito", "¡Evaluación «" + datos.nombre + "» creada con éxito!");
      }
      router.back();
    } catch (e) {
      // por ejemplo: el ramo pasaria de 100% o la fecha queda fuera del periodo (400)
      mostrarAviso("error", (e as Error).message);
      setGuardando(false);
    }
  }

  function confirmarEliminar() {
    Alert.alert("Eliminar evaluación", "¿Desea confirmar la eliminación de «" + nombre + "»?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarEvaluacion(idEvaluacion);
            dejarAviso("exito", "¡Se eliminó la evaluación «" + nombre + "»!");
            router.back();
          } catch (e) {
            mostrarAviso("error", (e as Error).message);
            setEliminando(false);
          }
        },
      },
    ]);
  }

  if (cargando) return <Cargando texto="Preparando formulario..." />;
  if (errorCarga) return <ErrorCarga mensaje={errorCarga} onReintentar={cargar} />;

  const yaUsado = ramoId ? usada[ramoId] ?? 0 : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: editando ? "Editar evaluación" : "Crear evaluación" }} />
      {elementoAviso}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Campo etiqueta="Nombre" obligatorio value={nombre} onChangeText={setNombre} placeholder="Ej: Solemne 1" maxLength={60} error={errores.nombre} />
        <Opciones
          etiqueta={editando ? "Ramo (no se puede cambiar)" : "Ramo"}
          obligatorio={!editando}
          opciones={ramos.map((r) => ({ valor: String(r.id), texto: r.nombre, color: r.color }))}
          valor={ramoId}
          onCambiar={setRamoId}
          deshabilitado={editando}
          error={errores.ramo}
        />
        <Opciones etiqueta="Tipo" obligatorio opciones={TIPOS_LISTA} valor={tipo} onCambiar={setTipo} colorActivo={COLOR} error={errores.tipo} />
        <SelectorFecha etiqueta="Fecha" obligatorio valor={fecha} onCambiar={setFecha} error={errores.fecha} />
        <Campo
          etiqueta="Ponderación (%)"
          obligatorio
          value={ponderacion}
          onChangeText={setPonderacion}
          placeholder="Ej: 30"
          keyboardType="number-pad"
          maxLength={3}
          error={errores.ponderacion}
        />
        {ramoId ? (
          <Text style={[estilos.ayuda, yaUsado + (ponderacionNumero || 0) > 100 && { color: COLORES.rojo }]}>
            Este ramo ya usa {yaUsado}% en otras evaluaciones (máximo 100%).
          </Text>
        ) : null}
        <Campo
          etiqueta="Nota (opcional, de 1.0 a 7.0)"
          value={nota}
          onChangeText={setNota}
          placeholder="Sin nota"
          keyboardType="decimal-pad"
          maxLength={3}
          error={errores.nota}
        />

        <BotonPrincipal texto={editando ? "Guardar cambios" : "Crear evaluación"} icono="checkmark" color={COLOR} cargando={guardando} onPress={guardar} />
        {editando ? <BotonEliminar texto="Eliminar evaluación" cargando={eliminando} onPress={confirmarEliminar} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 40,
  },
  ayuda: {
    marginTop: -10,
    marginBottom: 16,
    fontSize: 13,
    color: COLORES.textoSuave,
    fontWeight: "600",
  },
});
