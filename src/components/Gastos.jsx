import { useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase";

function Gastos({ proyectoId }) {
  const { usuario } = useContext(AuthContext);

  const [participantes, setParticipantes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [concepto, setConcepto] = useState("");
  const [importe, setImporte] = useState("");
  const [pagadoPor, setPagadoPor] = useState(usuario.uid);
  const [repartidoEntre, setRepartidoEntre] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const referencia = collection(db, "proyectos", proyectoId, "participantes");

    return onSnapshot(
      referencia,
      (resultado) => {
        const lista = resultado.docs.map((documento) => ({
          ...documento.data(),
          id: documento.id,
        }));

        setParticipantes(lista);
        setRepartidoEntre(lista.map((p) => p.id));
        setCargando(false);
      },
      () => {
        setError("No se han podido cargar los participantes.");
      },
    );
  }, [proyectoId]);

  useEffect(() => {
    const referencia = collection(db, "proyectos", proyectoId, "gastos");

    return onSnapshot(
      referencia,
      (resultado) => {
        setGastos(
          resultado.docs.map((documento) => ({
            ...documento.data(),
            id: documento.id,
          })),
        );
      },
      () => {
        setError("No se han podido cargar los gastos.");
      },
    );
  }, [proyectoId]);

  function cambiarSeleccion(id) {
    setRepartidoEntre((seleccionados) =>
      seleccionados.includes(id)
        ? seleccionados.filter((elemento) => elemento !== id)
        : [...seleccionados, id],
    );
  }

  function obtenerNombre(id) {
    return (
      participantes.find((p) => p.id === id)?.nombre ||
      "Participante desconocido"
    );
  }

  async function agregarGasto(e) {
    e.preventDefault();
    setError("");

    const importeCentimos = Math.round(Number(importe) * 100);

    if (
      !concepto.trim() ||
      !Number.isSafeInteger(importeCentimos) ||
      importeCentimos <= 0
    ) {
      setError("Introduce un concepto y un importe válido.");
      return;
    }

    if (repartidoEntre.length === 0) {
      setError("Selecciona al menos un participante.");
      return;
    }

    if (!participantes.some((p) => p.id === pagadoPor)) {
      setError("Selecciona quién ha pagado el gasto.");
      return;
    }

    if (!repartidoEntre.every((id) => participantes.some((p) => p.id === id))) {
      setError("Hay participantes que ya no existen.");
      return;
    }

    setGuardando(true);

    const datos = {
      concepto: concepto.trim(),
      importeCentimos,
      pagadoPor,
      repartidoEntre,
    };

    try {
      if (editandoId) {
        await updateDoc(
          doc(db, "proyectos", proyectoId, "gastos", editandoId),
          datos,
        );
      } else {
        await addDoc(collection(db, "proyectos", proyectoId, "gastos"), {
          ...datos,
          fechaCreacion: serverTimestamp(),
        });
      }

      limpiarFormulario();
    } catch {
      setError("No se ha podido guardar el gasto.");
    } finally {
      setGuardando(false);
    }
  }

  function editarGasto(gasto) {
    setEditandoId(gasto.id);
    setConcepto(gasto.concepto);
    setImporte((gasto.importeCentimos / 100).toFixed(2));
    setPagadoPor(gasto.pagadoPor);
    setRepartidoEntre([...gasto.repartidoEntre]);
    setError("");
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setConcepto("");
    setImporte("");
    setPagadoPor(usuario.uid);
    setRepartidoEntre(participantes.map((p) => p.id));
  }

  async function eliminarGasto(gasto) {
    if (!window.confirm(`¿Quieres eliminar el gasto "${gasto.concepto}"?`)) {
      return;
    }

    setError("");

    try {
      await deleteDoc(doc(db, "proyectos", proyectoId, "gastos", gasto.id));

      if (editandoId === gasto.id) {
        limpiarFormulario();
      }
    } catch {
      setError("No se ha podido eliminar el gasto.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={agregarGasto} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Concepto
          <input
            type="text"
            className="input w-full"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          Importe (€)
          <input
            type="number"
            className="input w-full"
            min="0.01"
            step="0.01"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          Pagado por
          <select
            className="select w-full"
            value={pagadoPor}
            onChange={(e) => setPagadoPor(e.target.value)}
            required
          >
            {participantes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-bold mb-2">Repartir entre</legend>

          {participantes.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={repartidoEntre.includes(p.id)}
                onChange={() => cambiarSeleccion(p.id)}
              />
              {p.nombre}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={guardando || cargando}
        >
          {guardando
            ? "Guardando..."
            : editandoId
              ? "Guardar cambios"
              : "Añadir gasto"}
        </button>

        {editandoId && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={limpiarFormulario}
            disabled={guardando}
          >
            Cancelar edición
          </button>
        )}
      </form>

      <div className="divider">Gastos registrados</div>

      {gastos.length === 0 && <p>Todavía no hay gastos registrados.</p>}

      {gastos.map((gasto) => (
        <div key={gasto.id} className="bg-base-200 rounded-lg p-4">
          <div className="flex justify-between">
            <strong>{gasto.concepto}</strong>
            <strong>{(gasto.importeCentimos / 100).toFixed(2)} €</strong>
          </div>

          <p>Pagado por: {obtenerNombre(gasto.pagadoPor)}</p>

          <p>
            Repartido entre:{" "}
            {gasto.repartidoEntre.map(obtenerNombre).join(", ")}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => editarGasto(gasto)}
              disabled={guardando}
            >
              Editar
            </button>

            <button
              className="btn btn-error btn-outline btn-sm"
              onClick={() => eliminarGasto(gasto)}
              disabled={guardando}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Gastos;
