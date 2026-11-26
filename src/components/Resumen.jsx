import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

function Resumen({ proyectoId }) {
  const [participantes, setParticipantes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(true);
  const [cargandoGastos, setCargandoGastos] = useState(true);
  const [error, setError] = useState("");

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

        setCargandoParticipantes(false);
      },
      () => {
        setError("No se han podido cargar los participantes.");
        setCargandoParticipantes(false);
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

        setCargandoGastos(false);
      },
      () => {
        setError("No se han podido cargar los gastos.");
        setCargandoGastos(false);
      },
    );
  }, [proyectoId]);

  function formatearImporte(centimos) {
    return (centimos / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  }

  const totalGastos = gastos.reduce(
    (total, gasto) => total + gasto.importeCentimos,
    0,
  );

  const balances = participantes.map((participante) => ({
    id: participante.id,
    nombre: participante.nombre,
    pagado: 0,
    correspondiente: 0,
    balance: 0,
  }));

  for (const gasto of gastos) {
    const pagador = balances.find((p) => p.id === gasto.pagadoPor);

    if (pagador) {
      pagador.pagado += gasto.importeCentimos;
    }

    const seleccionados = gasto.repartidoEntre;

    if (seleccionados.length === 0) continue;

    const cuota = Math.floor(gasto.importeCentimos / seleccionados.length);

    const resto = gasto.importeCentimos % seleccionados.length;

    seleccionados.forEach((id, indice) => {
      const participante = balances.find((p) => p.id === id);

      if (participante) {
        participante.correspondiente += cuota + (indice < resto ? 1 : 0);
      }
    });
  }

  balances.forEach((participante) => {
    participante.balance = participante.pagado - participante.correspondiente;
  });

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (cargandoParticipantes || cargandoGastos) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="stats bg-base-200 shadow">
        <div className="stat">
          <div className="stat-title">Gasto total</div>

          <div className="stat-value text-primary">
            {formatearImporte(totalGastos)}
          </div>

          <div className="stat-desc">{gastos.length} gastos registrados</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Participante</th>
              <th>Pagado</th>
              <th>Correspondiente</th>
              <th>Balance</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {balances.map((participante) => (
              <tr key={participante.id}>
                <td>{participante.nombre}</td>

                <td>{formatearImporte(participante.pagado)}</td>

                <td>{formatearImporte(participante.correspondiente)}</td>

                <td
                  className={`font-bold ${
                    participante.balance > 0
                      ? "text-success"
                      : participante.balance < 0
                        ? "text-error"
                        : ""
                  }`}
                >
                  {participante.balance > 0 ? "+" : ""}
                  {formatearImporte(participante.balance)}
                </td>

                <td>
                  {participante.balance > 0 ? (
                    <span className="badge badge-success">Debe recibir</span>
                  ) : participante.balance < 0 ? (
                    <span className="badge badge-error">Debe pagar</span>
                  ) : (
                    <span className="badge badge-neutral">Saldado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Resumen;
