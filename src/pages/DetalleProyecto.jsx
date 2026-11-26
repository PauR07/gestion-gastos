import { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../config/firebase";
import Participantes from "../components/Participantes";
import Gastos from "../components/Gastos";
import Resumen from "../components/Resumen";

function DetalleProyecto() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);

  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const proyectoRef = doc(db, "proyectos", id);

    const cancelarSuscripcion = onSnapshot(
      proyectoRef,
      (documento) => {
        if (!documento.exists()) {
          setError("El proyecto no existe.");
        } else if (documento.data().propietarioId !== usuario.uid) {
          setError("No tienes permiso para acceder a este proyecto.");
        } else {
          setProyecto({
            ...documento.data(),
            id: documento.id,
          });
          setError("");
        }

        setCargando(false);
      },
      () => {
        setError("No se ha podido acceder al proyecto.");
        setCargando(false);
      },
    );

    return cancelarSuscripcion;
  }, [id, usuario.uid]);

  if (cargando) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-error">{error}</div>

        <Link to="/" className="btn btn-outline">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  if (!proyecto) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">{proyecto.titulo}</h1>

        <Link to="/" className="btn btn-outline">
          Volver a mis proyectos
        </Link>
      </div>

      <section className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Gastos</h2>

          <Gastos proyectoId={id} />
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Participantes</h2>

          <Participantes proyectoId={id} />
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Resumen económico</h2>

          <Resumen proyectoId={id} />
        </div>
      </section>
    </div>
  );
}

export default DetalleProyecto;
