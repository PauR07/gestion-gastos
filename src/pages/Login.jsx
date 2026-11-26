import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Inicio de sesión mediante Firebase
  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          setError("Correo electrónico o contraseña incorrectos.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Inténtalo más tarde.");
          break;
        case "auth/network-request-failed":
          setError("Error de conexión. Comprueba tu conexión a Internet.");
          break;
        default:
          setError("No se ha podido iniciar sesión.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

          <form onSubmit={iniciarSesion} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              Correo electrónico
              <input
                type="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              Contraseña
              <input
                type="password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={cargando}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className="link link-primary">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
