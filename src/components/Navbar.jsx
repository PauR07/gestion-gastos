import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { usuario, cerrarSesion } = useContext(AuthContext);
  const navigate = useNavigate();

  async function salir() {
    await cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Gestión de gastos
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span>{usuario.displayName || usuario.email}</span>

        <button className="btn btn-outline btn-error" onClick={salir}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
