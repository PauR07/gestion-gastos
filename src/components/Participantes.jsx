import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
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

    if (!nombre.trim()) return;

    try {
      await addDoc(collection(db, "proyectos", proyectoId, "participantes"), {
        nombre: nombre.trim(),
        usuarioId: null,
      });

      setNombre("");
    } catch {
      setError("No se ha podido añadir el participante.");
    }
  }

  function editarParticipante(participante) {
    setEditandoId(participante.id);
    setNombreEdicion(participante.nombre);
    setError("");
  }

  async function guardarEdicion() {
    setError("");

    if (!nombreEdicion.trim()) return;

    try {
      await updateDoc(
        doc(db, "proyectos", proyectoId, "participantes", editandoId),
        {
          nombre: nombreEdicion.trim(),
        },
      );

      cancelarEdicion();
    } catch {
      setError("No se ha podido modificar el participante.");
    }
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombreEdicion("");
  }

  async function eliminarParticipante(participante) {
    setError("");

    if (participante.usuarioId) {
      setError("No se puede eliminar al propietario.");
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

      const gastosPagados = await getDocs(
        query(referenciaGastos, where("pagadoPor", "==", participante.id)),
      );

      const gastosRepartidos = await getDocs(
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

      if (!window.confirm(`¿Quieres eliminar a ${participante.nombre}?`)) {
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
                value={nombreEdicion}
                onChange={(e) => setNombreEdicion(e.target.value)}
              />

              <button
                className="btn btn-success btn-sm"
                onClick={guardarEdicion}
              >
                Guardar
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={cancelarEdicion}
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
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-error btn-outline btn-sm"
                    onClick={() => eliminarParticipante(participante)}
                    disabled={eliminando}
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
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary">
          Añadir participante
        </button>
      </form>
    </div>
  );
}

export default Participantes;
