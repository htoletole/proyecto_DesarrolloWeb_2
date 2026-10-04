import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tareas from "./pages/Tareas";
import Ramos from "./pages/Ramos";
import Calendario from "./pages/Calendario";
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
          <Route path="/" element={<Dashboard username="Florencia" />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/ramos" element={<Ramos />} />
          <Route path="/calendario" element={<Calendario />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
