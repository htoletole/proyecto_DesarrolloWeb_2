// pantalla de login: usa el mismo usuario y contraseña que la web
import { useRef, useState } from "react";
import type { ComponentRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSesion } from "../services/sesion";
import { COLORES } from "../services/colores";
import { URL_API } from "../services/api";

export default function Login() {
  const { entrar } = useSesion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const campoPassword = useRef<ComponentRef<typeof TextInput>>(null);

  async function ingresar() {
    // se revisa antes de llamar a la API (la API vuelve a validar)
    if (username.trim() === "" || password === "") {
      setError("Completa tu usuario y tu contraseña.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      await entrar(username, password);
      // al guardar la sesion, el layout cambia solo a las pestañas
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.fondo}>
      <KeyboardAvoidingView style={estilos.contenido} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={estilos.marca}>
          <View style={estilos.logo}>
            <Ionicons name="school" size={40} color={COLORES.azul} />
          </View>
          <Text style={estilos.titulo}>Syllab</Text>
          <Text style={estilos.subtitulo}>Tu agenda académica en el bolsillo</Text>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.etiqueta}>Usuario</Text>
          <TextInput
            style={estilos.campo}
            value={username}
            onChangeText={setUsername}
            placeholder="Tu nombre de usuario"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            onSubmitEditing={() => campoPassword.current?.focus()}
            editable={!enviando}
          />

          <Text style={estilos.etiqueta}>Contraseña</Text>
          <View style={estilos.campoConBoton}>
            <TextInput
              ref={campoPassword}
              style={[estilos.campo, { flex: 1, borderWidth: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={ingresar}
              editable={!enviando}
            />
            <Pressable
              onPress={() => setVerPassword(!verPassword)}
              style={estilos.ojo}
              accessibilityLabel={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <Ionicons name={verPassword ? "eye-off-outline" : "eye-outline"} size={22} color={COLORES.textoSuave} />
            </Pressable>
          </View>

          {error !== "" ? (
            <View style={estilos.error} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={18} color={COLORES.rojo} />
              <Text style={estilos.textoError}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [estilos.boton, (pressed || enviando) && { opacity: 0.8 }]}
            onPress={ingresar}
            disabled={enviando}
            accessibilityRole="button"
          >
            {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.textoBoton}>Ingresar</Text>}
          </Pressable>
        </View>

        <Text style={estilos.servidor}>Servidor: {URL_API}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: COLORES.azul,
  },
  contenido: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  marca: {
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  titulo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitulo: {
    fontSize: 15,
    color: "#D6E2F5",
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 4,
  },
  campo: {
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORES.texto,
    backgroundColor: "#FFFFFF",
  },
  campoConBoton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
  },
  ojo: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FDECEC",
    padding: 10,
    borderRadius: 10,
  },
  textoError: {
    flex: 1,
    color: COLORES.rojo,
    fontSize: 14,
    fontWeight: "600",
  },
  boton: {
    marginTop: 10,
    backgroundColor: COLORES.verde,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  servidor: {
    textAlign: "center",
    color: "#AFC2E0",
    fontSize: 12,
  },
});
