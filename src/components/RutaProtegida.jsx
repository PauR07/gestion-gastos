import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";

function RutaProtegida() {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />

      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </>
  );
}

export default RutaProtegida;
