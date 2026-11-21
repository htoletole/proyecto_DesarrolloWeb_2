// piezas de los formularios pensadas para el dedo: campos, opciones en botones, fecha, hora y colores
import { useState } from "react";
import type { ComponentProps } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORES, colorDeTexto, colorDeTextoGrande } from "../services/colores";
import { fechaConAnio } from "../services/fechas";

// ---------- campo de texto ----------

type PropsCampo = ComponentProps<typeof TextInput> & {
  etiqueta: string;
  error?: string;
  obligatorio?: boolean;
};

export function Campo({ etiqueta, error, obligatorio, style, ...resto }: PropsCampo) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>
        {etiqueta}
        {obligatorio ? <Text style={{ color: COLORES.rojo }}> *</Text> : null}
      </Text>
      <TextInput
        style={[estilos.campo, error ? estilos.campoError : null, style]}
        placeholderTextColor="#9AA1AC"
        {...resto}
      />
      {error ? <Text style={estilos.textoError}>{error}</Text> : null}
    </View>
  );
}

// ---------- opciones (reemplaza a los <select> de la web) ----------

type Opcion = { valor: string; texto: string; color?: string };

export function Opciones({
  etiqueta,
  opciones,
  valor,
  onCambiar,
  colorActivo = COLORES.azul,
  error,
  obligatorio,
  deshabilitado,
}: {
  etiqueta: string;
  opciones: Opcion[];
  valor: string;
  onCambiar: (valor: string) => void;
  colorActivo?: string;
  error?: string;
  obligatorio?: boolean;
  deshabilitado?: boolean;
}) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>
        {etiqueta}
        {obligatorio ? <Text style={{ color: COLORES.rojo }}> *</Text> : null}
      </Text>
      <View style={estilos.opciones}>
        {opciones.map((o) => {
          const activo = o.valor === valor;
          const color = o.color ?? colorActivo;
          return (
            <Pressable
              key={o.valor}
              onPress={() => !deshabilitado && onCambiar(o.valor)}
              style={[
                estilos.opcion,
                activo && { backgroundColor: color, borderColor: color },
                deshabilitado && !activo && { opacity: 0.4 },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo, disabled: deshabilitado }}
            >
              <Text style={[estilos.textoOpcion, activo && { color: colorDeTexto(color) }]}>{o.texto}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={estilos.textoError}>{error}</Text> : null}
    </View>
  );
}

// ---------- fecha y hora (selector nativo del celular) ----------

function aDate(texto: string): Date {
  if (!texto) return new Date();
  const p = texto.split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function aTextoFecha(fecha: Date): string {
  return fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0") + "-" + String(fecha.getDate()).padStart(2, "0");
}

export function SelectorFecha({
  etiqueta,
  valor,
  onCambiar,
  obligatorio,
  error,
}: {
  etiqueta: string;
  valor: string; // "AAAA-MM-DD" o ""
  onCambiar: (valor: string) => void;
  obligatorio?: boolean;
  error?: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>
        {etiqueta}
        {obligatorio ? <Text style={{ color: COLORES.rojo }}> *</Text> : null}
      </Text>
      <View style={estilos.fila}>
        <Pressable
          onPress={() => setAbierto(!abierto)}
          style={[estilos.campo, estilos.boton, { flex: 1 }, error ? estilos.campoError : null]}
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={20} color={COLORES.textoSuave} />
          <Text style={[estilos.textoBoton, !valor && { color: "#9AA1AC" }]}>{valor ? fechaConAnio(valor) : "Elegir fecha"}</Text>
        </Pressable>
        {valor && !obligatorio ? (
          <Pressable onPress={() => onCambiar("")} style={estilos.quitar} accessibilityLabel="Quitar fecha">
            <Ionicons name="close-circle" size={26} color={COLORES.textoSuave} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={estilos.textoError}>{error}</Text> : null}

      {abierto ? (
        <View>
          <DateTimePicker
            value={aDate(valor)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(evento, fecha) => {
              // en Android el selector se cierra solo; en iOS se queda abierto hasta tocar "Listo"
              if (Platform.OS === "android") setAbierto(false);
              if (evento.type === "set" && fecha) onCambiar(aTextoFecha(fecha));
            }}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setAbierto(false)} style={estilos.listo}>
              <Text style={estilos.textoListo}>Listo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function SelectorHora({ etiqueta, valor, onCambiar }: { etiqueta: string; valor: string; onCambiar: (valor: string) => void }) {
  const [abierto, setAbierto] = useState(false);

  function aDateHora(texto: string): Date {
    const fecha = new Date();
    if (texto) {
      const p = texto.split(":");
      fecha.setHours(Number(p[0]), Number(p[1]), 0, 0);
    }
    return fecha;
  }

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.fila}>
        <Pressable onPress={() => setAbierto(!abierto)} style={[estilos.campo, estilos.boton, { flex: 1 }]} accessibilityRole="button">
          <Ionicons name="time-outline" size={20} color={COLORES.textoSuave} />
          <Text style={[estilos.textoBoton, !valor && { color: "#9AA1AC" }]}>{valor || "Sin hora"}</Text>
        </Pressable>
        {valor ? (
          <Pressable onPress={() => onCambiar("")} style={estilos.quitar} accessibilityLabel="Quitar hora">
            <Ionicons name="close-circle" size={26} color={COLORES.textoSuave} />
          </Pressable>
        ) : null}
      </View>
      {abierto ? (
        <View>
          <DateTimePicker
            value={aDateHora(valor)}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(evento, fecha) => {
              if (Platform.OS === "android") setAbierto(false);
              if (evento.type === "set" && fecha) {
                onCambiar(String(fecha.getHours()).padStart(2, "0") + ":" + String(fecha.getMinutes()).padStart(2, "0"));
              }
            }}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setAbierto(false)} style={estilos.listo}>
              <Text style={estilos.textoListo}>Listo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ---------- color del ramo (paleta) ----------

export function SelectorColor({ valor, onCambiar, colores }: { valor: string; onCambiar: (c: string) => void; colores: string[] }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.etiqueta}>Color del ramo</Text>
      <View style={estilos.paleta}>
        {colores.map((c) => {
          const activo = c.toUpperCase() === valor.toUpperCase();
          return (
            <Pressable
              key={c}
              onPress={() => onCambiar(c)}
              style={[estilos.muestra, { backgroundColor: c }, activo && estilos.muestraActiva]}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              accessibilityLabel={"Color " + c}
            >
              {activo ? <Ionicons name="checkmark" size={22} color={colorDeTexto(c)} /> : null}
            </Pressable>
          );
        })}
      </View>
      {/* vista previa: el texto se pone casi negro o blanco segun el color */}
      <View style={[estilos.vista, { backgroundColor: valor }]}>
        <Text style={{ color: colorDeTexto(valor), fontWeight: "800", fontSize: 16 }}>Así se verá tu ramo</Text>
      </View>
    </View>
  );
}

// ---------- botones ----------

export function BotonPrincipal({
  texto,
  onPress,
  color,
  cargando,
  icono,
}: {
  texto: string;
  onPress: () => void;
  color: string;
  cargando?: boolean;
  icono?: keyof typeof Ionicons.glyphMap;
}) {
  const colorTexto = colorDeTextoGrande(color);
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [estilos.principal, { backgroundColor: color }, (pressed || cargando) && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      {cargando ? (
        <ActivityIndicator color={colorTexto} />
      ) : (
        <>
          {icono ? <Ionicons name={icono} size={20} color={colorTexto} /> : null}
          <Text style={[estilos.textoPrincipal, { color: colorTexto }]}>{texto}</Text>
        </>
      )}
    </Pressable>
  );
}

export function BotonEliminar({ texto, onPress, cargando }: { texto: string; onPress: () => void; cargando?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [estilos.eliminar, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
    >
      {cargando ? <ActivityIndicator color={COLORES.rojo} /> : <Ionicons name="trash-outline" size={20} color={COLORES.rojo} />}
      <Text style={estilos.textoEliminar}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto,
    marginBottom: 6,
  },
  campo: {
    backgroundColor: COLORES.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORES.texto,
  },
  campoError: {
    borderColor: COLORES.rojo,
  },
  textoError: {
    color: COLORES.rojo,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  opciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  opcion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.tarjeta,
  },
  textoOpcion: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORES.texto,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textoBoton: {
    fontSize: 16,
    color: COLORES.texto,
  },
  quitar: {
    padding: 4,
  },
  listo: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textoListo: {
    color: COLORES.azul,
    fontWeight: "800",
    fontSize: 16,
  },
  paleta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  muestra: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  muestraActiva: {
    borderWidth: 3,
    borderColor: COLORES.texto,
  },
  vista: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
  },
  principal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 26,
    marginTop: 8,
  },
  textoPrincipal: {
    fontSize: 17,
    fontWeight: "800",
  },
  eliminar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  textoEliminar: {
    color: COLORES.rojo,
    fontSize: 16,
    fontWeight: "700",
  },
});
