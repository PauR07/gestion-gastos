import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocsFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

function Participantes({ proyectoId }) {
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdicion, setNombreEdicion] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const referencia = collection(db, "proyectos", proyectoId, "participantes");

    return onSnapshot(
      referencia,
      (resultado) => {
        setParticipantes(
          resultado.docs.map((documento) => ({
            ...documento.data(),
            id: documento.id,
          })),
        );

        setCargando(false);
      },
      () => {
        setError("No se han podido cargar los participantes.");
        setCargando(false);
      },
    );
  }, [proyectoId]);

  async function agregarParticipante(e) {
    e.preventDefault();
    setError("");

    const nombreValido = nombre.trim();

    if (!nombreValido || nombreValido.length > 100) {
      setError("Introduce un nombre de entre 1 y 100 caracteres.");
      return;
    }

    setGuardando(true);

    try {
      await addDoc(collection(db, "proyectos", proyectoId, "participantes"), {
        nombre: nombreValido,
        usuarioId: null,
      });

      setNombre("");
    } catch {
      setError("No se ha podido añadir el participante.");
    } finally {
      setGuardando(false);
    }
  }

  function editarParticipante(participante) {
    setEditandoId(participante.id);
    setNombreEdicion(participante.nombre);
    setError("");
  }

  async function guardarEdicion() {
    setError("");

    const nombreValido = nombreEdicion.trim();

    if (!nombreValido || nombreValido.length > 100) {
      setError("Introduce un nombre de entre 1 y 100 caracteres.");
      return;
    }

    setGuardando(true);

    try {
      await updateDoc(
        doc(db, "proyectos", proyectoId, "participantes", editandoId),
        {
          nombre: nombreValido,
        },
      );

      cancelarEdicion();
    } catch {
      setError("No se ha podido modificar el participante.");
    } finally {
      setGuardando(false);
    }
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombreEdicion("");
    setError("");
  }

  async function eliminarParticipante(participante) {
    setError("");

    if (participante.usuarioId) {
      setError("No se puede eliminar al propietario.");
      return;
    }

    if (!window.confirm(`¿Quieres eliminar a ${participante.nombre}?`)) {
      return;
    }

    setEliminando(true);

    try {
      const referenciaGastos = collection(
        db,
        "proyectos",
        proyectoId,
        "gastos",
      );

      const gastosPagados = await getDocsFromServer(
        query(referenciaGastos, where("pagadoPor", "==", participante.id)),
      );

      const gastosRepartidos = await getDocsFromServer(
        query(
          referenciaGastos,
          where("repartidoEntre", "array-contains", participante.id),
        ),
      );

      if (!gastosPagados.empty || !gastosRepartidos.empty) {
        setError(
          "No se puede eliminar este participante porque tiene gastos asociados.",
        );
        return;
      }

      await deleteDoc(
        doc(db, "proyectos", proyectoId, "participantes", participante.id),
      );

      if (editandoId === participante.id) {
        cancelarEdicion();
      }
    } catch {
      setError("No se ha podido eliminar el participante.");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <div className="alert alert-error">{error}</div>}

      {cargando && <span className="loading loading-spinner"></span>}

      {participantes.map((participante) => (
        <div
          key={participante.id}
          className="flex flex-wrap justify-between items-center gap-2 bg-base-200 rounded-lg p-3"
        >
          {editandoId === participante.id ? (
            <>
              <input
                type="text"
                className="input flex-1"
                maxLength={100}
                value={nombreEdicion}
                onChange={(e) => setNombreEdicion(e.target.value)}
                disabled={guardando || eliminando}
              />

              <button
                className="btn btn-success btn-sm"
                onClick={guardarEdicion}
                disabled={guardando || eliminando}
              >
                Guardar
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={cancelarEdicion}
                disabled={guardando || eliminando}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <span>{participante.nombre}</span>

              {participante.usuarioId ? (
                <span className="badge badge-primary">Propietario</span>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => editarParticipante(participante)}
                    disabled={guardando || eliminando}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-error btn-outline btn-sm"
                    onClick={() => eliminarParticipante(participante)}
                    disabled={guardando || eliminando}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <form
        onSubmit={agregarParticipante}
        className="flex flex-wrap gap-2 mt-2"
      >
        <input
          type="text"
          className="input flex-1"
          placeholder="Nombre del participante"
          maxLength={100}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={guardando || eliminando}
          required
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={guardando || eliminando || cargando}
        >
          Añadir participante
        </button>
      </form>
    </div>
  );
}

export default Participantes;
