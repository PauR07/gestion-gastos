import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Registro del usuario en Firebase
  async function registrarUsuario(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const credenciales = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Guardar el nombre del usuario
      await updateProfile(credenciales.user, {
        displayName: nombre.trim(),
      });

      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("El correo electrónico ya está registrado.");
          break;
        case "auth/weak-password":
          setError("La contraseña es demasiado débil.");
          break;
        case "auth/invalid-email":
          setError("El correo electrónico no es válido.");
          break;
        default:
          setError("No se ha podido completar el registro.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>

          <form onSubmit={registrarUsuario} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              Nombre
              <input
                type="text"
                className="input w-full"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                pattern=".*\S.*"
                required
              />
            </label>

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
                minLength={6}
                required
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={cargando}
            >
              {cargando ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="link link-primary">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
