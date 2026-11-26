import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocsFromServer,
  writeBatch,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase";

function Proyectos() {
  const { usuario } = useContext(AuthContext);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [tituloEdicion, setTituloEdicion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const consulta = query(
      collection(db, "proyectos"),
      where("propietarioId", "==", usuario.uid),
    );

    return onSnapshot(
      consulta,
      (resultado) => {
        setProyectos(
          resultado.docs.map((documento) => ({
            ...documento.data(),
            id: documento.id,
          })),
        );

        setCargando(false);
      },
      () => {
        setError("No se han podido cargar los proyectos.");
        setCargando(false);
      },
    );
  }, [usuario.uid]);

  function editarProyecto(proyecto) {
    setEditandoId(proyecto.id);
    setTituloEdicion(proyecto.titulo);
    setError("");
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setTituloEdicion("");
    setError("");
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setError("");

    const tituloValido = tituloEdicion.trim();

    if (!tituloValido || tituloValido.length > 150) {
      setError("Introduce un título de entre 1 y 150 caracteres.");
      return;
    }

    setGuardando(true);

    try {
      await updateDoc(doc(db, "proyectos", editandoId), {
        titulo: tituloValido,
      });

      cancelarEdicion();
    } catch {
      setError("No se ha podido modificar el proyecto.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProyecto(proyecto) {
    setError("");

    if (
      !window.confirm(
        `¿Quieres eliminar el proyecto "${proyecto.titulo}" y todos sus gastos y participantes?`,
      )
    ) {
      return;
    }

    setEliminando(true);

    try {
      const referenciaProyecto = doc(db, "proyectos", proyecto.id);

      const gastos = await getDocsFromServer(
        collection(referenciaProyecto, "gastos"),
      );

      const participantes = await getDocsFromServer(
        collection(referenciaProyecto, "participantes"),
      );

      if (gastos.size + participantes.size + 1 > 500) {
        setError(
          "El proyecto contiene demasiados documentos para eliminarlo en una sola operación.",
        );
        return;
      }

      const lote = writeBatch(db);

      gastos.docs.forEach((documento) => {
        lote.delete(documento.ref);
      });

      participantes.docs.forEach((documento) => {
        lote.delete(documento.ref);
      });

      lote.delete(referenciaProyecto);

      await lote.commit();

      if (editandoId === proyecto.id) {
        cancelarEdicion();
      }
    } catch {
      setError("No se ha podido eliminar el proyecto.");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-3xl font-bold">Mis proyectos</h1>

        <Link to="/proyectos/nuevo" className="btn btn-primary">
          Nuevo proyecto
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {cargando && <span className="loading loading-spinner"></span>}

      {!cargando && proyectos.length === 0 && (
        <p>Todavía no tienes proyectos.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proyectos.map((proyecto) => (
          <div
            key={proyecto.id}
            className="card bg-base-100 border border-base-300 shadow-md"
          >
            <div className="card-body">
              {editandoId === proyecto.id ? (
                <form onSubmit={guardarEdicion} className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="input w-full"
                    maxLength={150}
                    value={tituloEdicion}
                    onChange={(e) => setTituloEdicion(e.target.value)}
                    disabled={guardando || eliminando}
                    required
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success btn-sm"
                      disabled={guardando || eliminando}
                    >
                      Guardar
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={cancelarEdicion}
                      disabled={guardando || eliminando}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="card-title">{proyecto.titulo}</h2>

                  <div className="card-actions mt-3">
                    <Link
                      to={`/proyectos/${proyecto.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Abrir proyecto
                    </Link>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => editarProyecto(proyecto)}
                      disabled={guardando || eliminando}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-error btn-outline btn-sm"
                      onClick={() => eliminarProyecto(proyecto)}
                      disabled={guardando || eliminando}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Proyectos;
