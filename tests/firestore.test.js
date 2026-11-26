import { readFileSync } from "node:fs";
import { before, after, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

let entorno;

const proyectoId = "proyecto-prueba";
const propietarioId = "usuario-propietario";
const otroUsuarioId = "usuario-ajeno";

before(async () => {
  entorno = await initializeTestEnvironment({
    projectId: "demo-gestion-gastos",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8")
    }
  });
});

beforeEach(async () => {
  await entorno.clearFirestore();

  await entorno.withSecurityRulesDisabled(async (contexto) => {
    const db = contexto.firestore();

    await setDoc(doc(db, "proyectos", proyectoId), {
      titulo: "Proyecto de prueba",
      propietarioId: propietarioId,
      fechaCreacion: Timestamp.now()
    });

    await setDoc(
      doc(db, "proyectos", proyectoId, "participantes", propietarioId),
      {
        nombre: "Propietario",
        usuarioId: propietarioId
      }
    );
  });
});

after(async () => {
  if (entorno) {
    await entorno.cleanup();
  }
});

test("El propietario puede consultar su proyecto", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertSucceeds(
    getDoc(doc(db, "proyectos", proyectoId))
  );
});

test("Otro usuario no puede consultar el proyecto", async () => {
  const db = entorno.authenticatedContext(otroUsuarioId).firestore();

  await assertFails(
    getDoc(doc(db, "proyectos", proyectoId))
  );
});

test("Un usuario no autenticado no puede consultar el proyecto", async () => {
  const db = entorno.unauthenticatedContext().firestore();

  await assertFails(
    getDoc(doc(db, "proyectos", proyectoId))
  );
});

test("El propietario puede modificar el titulo", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertSucceeds(
    updateDoc(doc(db, "proyectos", proyectoId), {
      titulo: "Proyecto modificado"
    })
  );
});

test("No se puede modificar el propietario del proyecto", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    updateDoc(doc(db, "proyectos", proyectoId), {
      propietarioId: otroUsuarioId
    })
  );
});

test("Otro usuario no puede eliminar el proyecto", async () => {
  const db = entorno.authenticatedContext(otroUsuarioId).firestore();

  await assertFails(
    deleteDoc(doc(db, "proyectos", proyectoId))
  );
});

test("El propietario puede registrar un gasto valido", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertSucceeds(
    setDoc(doc(db, "proyectos", proyectoId, "gastos", "gasto1"), {
      concepto: "Comida",
      importeCentimos: 2000,
      pagadoPor: propietarioId,
      repartidoEntre: [propietarioId],
      fechaCreacion: serverTimestamp()
    })
  );
});

test("No se puede registrar un gasto negativo", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    setDoc(doc(db, "proyectos", proyectoId, "gastos", "gasto1"), {
      concepto: "Comida",
      importeCentimos: -2000,
      pagadoPor: propietarioId,
      repartidoEntre: [propietarioId],
      fechaCreacion: serverTimestamp()
    })
  );
});

test("No se puede registrar un gasto con un pagador inexistente", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    setDoc(doc(db, "proyectos", proyectoId, "gastos", "gasto1"), {
      concepto: "Comida",
      importeCentimos: 2000,
      pagadoPor: "participante-inexistente",
      repartidoEntre: [propietarioId],
      fechaCreacion: serverTimestamp()
    })
  );
});

test("No se puede registrar un gasto sin participantes en el reparto", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    setDoc(doc(db, "proyectos", proyectoId, "gastos", "gasto1"), {
      concepto: "Comida",
      importeCentimos: 2000,
      pagadoPor: propietarioId,
      repartidoEntre: [],
      fechaCreacion: serverTimestamp()
    })
  );
});
test("No se puede repartir un gasto entre participantes inexistentes", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    setDoc(doc(db, "proyectos", proyectoId, "gastos", "gasto1"), {
      concepto: "Comida",
      importeCentimos: 2000,
      pagadoPor: propietarioId,
      repartidoEntre: [propietarioId, "participante-inexistente"],
      fechaCreacion: serverTimestamp()
    })
  );
});
test("No se puede eliminar al participante propietario", async () => {
  const db = entorno.authenticatedContext(propietarioId).firestore();

  await assertFails(
    deleteDoc(
      doc(db, "proyectos", proyectoId, "participantes", propietarioId)
    )
  );
});