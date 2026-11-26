import { useContext, useState } from "react";
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase";

function NuevoProyecto() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [nombreParticipante, setNombreParticipante] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function agregarParticipante() {
    const nombre = nombreParticipante.trim();

    if (!nombre) return;

    setParticipantes([
      ...participantes,
      {
        id: crypto.randomUUID(),
        nombre,
      },
    ]);

    setNombreParticipante("");
  }

  function eliminarParticipante(id) {
    setParticipantes(
      participantes.filter((participante) => participante.id !== id),
    );
  }

  async function crearProyecto(e) {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError("Introduce un título para el proyecto.");
      return;
    }

    setCargando(true);

    try {
      const proyectoRef = doc(collection(db, "proyectos"));
      const batch = writeBatch(db);

      batch.set(proyectoRef, {
        titulo: titulo.trim(),
        propietarioId: usuario.uid,
        fechaCreacion: serverTimestamp(),
      });

      const propietarioRef = doc(proyectoRef, "participantes", usuario.uid);

      batch.set(propietarioRef, {
        nombre: usuario.displayName || usuario.email,
        usuarioId: usuario.uid,
      });

      participantes.forEach((participante) => {
        const participanteRef = doc(
          proyectoRef,
          "participantes",
          participante.id,
        );

        batch.set(participanteRef, {
          nombre: participante.nombre,
          usuarioId: null,
        });
      });

      await batch.commit();

      navigate(`/proyectos/${proyectoRef.id}`);
    } catch {
      setError("No se ha podido crear el proyecto.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Crear proyecto</h1>

      <form
        onSubmit={crearProyecto}
        className="card bg-base-100 shadow-md border border-base-300"
      >
        <div className="card-body gap-4">
          <label className="flex flex-col gap-1">
            Título del proyecto
            <input
              type="text"
              className="input w-full"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </label>

          <h2 className="text-xl font-bold">Participantes</h2>

          <div className="flex justify-between items-center bg-base-200 rounded-lg p-3">
            <span>{usuario.displayName || usuario.email}</span>
            <span className="badge badge-primary">Propietario</span>
          </div>

          {participantes.map((participante) => (
            <div
              key={participante.id}
              className="flex justify-between items-center bg-base-200 rounded-lg p-3"
            >
              <span>{participante.nombre}</span>

              <button
                type="button"
                className="btn btn-error btn-sm btn-outline"
                onClick={() => eliminarParticipante(participante.id)}
              >
                Eliminar
              </button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Nombre del participante"
              value={nombreParticipante}
              onChange={(e) => setNombreParticipante(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={agregarParticipante}
            >
              Añadir
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card-actions justify-end mt-4">
            <Link to="/" className="btn btn-ghost">
              Cancelar
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={cargando}
            >
              {cargando ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NuevoProyecto;
