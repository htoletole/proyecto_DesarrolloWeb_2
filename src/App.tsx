import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tareas from "./pages/Tareas";
import Ramos from "./pages/Ramos";
import Calendario from "./pages/Calendario";
import Evaluaciones from "./pages/Evaluaciones";
import Periodos from "./pages/Periodos";
import Historial from "./pages/Historial";
import Navbar from "./components/Navbar";
import AuthGate from "./components/AuthGate";
import "./styles/app.css";

function App() {
  return (
    <div className="contenedor-principal">
      <AuthGate />
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/ramos" element={<Ramos />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/evaluaciones" element={<Evaluaciones />} />
          <Route path="/periodos" element={<Periodos />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
