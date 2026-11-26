import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RutaProtegida from "./components/RutaProtegida";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Proyectos from "./pages/Proyectos";
import NuevoProyecto from "./pages/NuevoProyecto";
import DetalleProyecto from "./pages/DetalleProyecto";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<RutaProtegida />}>
            <Route path="/" element={<Proyectos />} />
            <Route path="/proyectos/nuevo" element={<NuevoProyecto />} />
            <Route path="/proyectos/:id" element={<DetalleProyecto />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
