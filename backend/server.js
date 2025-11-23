// backend/server.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// ---------------- Movimientos (por ahora en memoria) ----------------

// Estructura de ejemplo de un movimiento:
// {
//   id: 1,
//   tipo: "gasto" | "ingreso",
//   categoria: "Comida",
//   monto: 5000,
//   fecha: "2025-11-22",
//   descripcion: "Almuerzo con amigos"
// }

let movimientos = [];
let nextId = 1;

// GET /movimientos -> lista todos
app.get("/movimientos", (req, res) => {
  res.json(movimientos);
});

// POST /movimientos -> crea uno nuevo
app.post("/movimientos", (req, res) => {
  const { tipo, categoria, monto, fecha, descripcion } = req.body;

  if (!tipo || !categoria || !monto || !fecha) {
    return res
      .status(400)
      .json({ error: "tipo, categoria, monto y fecha son obligatorios" });
  }

  const nuevoMovimiento = {
    id: nextId++,
    tipo,
    categoria,
    monto: Number(monto),
    fecha,
    descripcion: descripcion || "",
  };

  movimientos.push(nuevoMovimiento);
  res.status(201).json(nuevoMovimiento);
});

// PUT /movimientos/:id -> actualiza uno
app.put("/movimientos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = movimientos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Movimiento no encontrado" });
  }

  const { tipo, categoria, monto, fecha, descripcion } = req.body;

  movimientos[index] = {
    ...movimientos[index],
    tipo: tipo ?? movimientos[index].tipo,
    categoria: categoria ?? movimientos[index].categoria,
    monto: monto !== undefined ? Number(monto) : movimientos[index].monto,
    fecha: fecha ?? movimientos[index].fecha,
    descripcion: descripcion ?? movimientos[index].descripcion,
  };

  res.json(movimientos[index]);
});

// DELETE /movimientos/:id -> borra uno
app.delete("/movimientos/:id", (req, res) => {
  const id = Number(req.params.id);
  const existe = movimientos.some((m) => m.id === id);

  if (!existe) {
    return res.status(404).json({ error: "Movimiento no encontrado" });
  }

  movimientos = movimientos.filter((m) => m.id !== id);
  res.status(204).send(); // sin body
});
// ---------------- Metas (por ahora en memoria) ----------------

let metas = [];
let nextMetaId = 1;

// GET /metas -> lista todas las metas
app.get("/metas", (req, res) => {
  res.json(metas);
});

// POST /metas -> crea una nueva meta
app.post("/metas", (req, res) => {
  const { nombre, montoObjetivo, montoActual, fechaLimite, descripcion } =
    req.body;

  if (!nombre || !montoObjetivo) {
    return res
      .status(400)
      .json({ error: "nombre y montoObjetivo son obligatorios" });
  }

  const nuevaMeta = {
    id: nextMetaId++,
    nombre,
    montoObjetivo: Number(montoObjetivo),
    montoActual: montoActual ? Number(montoActual) : 0,
    fechaLimite: fechaLimite || "",
    descripcion: descripcion || "",
  };

  metas.push(nuevaMeta);
  res.status(201).json(nuevaMeta);
});

// PUT /metas/:id -> actualiza datos de una meta
app.put("/metas/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = metas.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Meta no encontrada" });
  }

  const { nombre, montoObjetivo, montoActual, fechaLimite, descripcion } =
    req.body;

  metas[index] = {
    ...metas[index],
    nombre: nombre ?? metas[index].nombre,
    montoObjetivo:
      montoObjetivo !== undefined
        ? Number(montoObjetivo)
        : metas[index].montoObjetivo,
    montoActual:
      montoActual !== undefined
        ? Number(montoActual)
        : metas[index].montoActual,
    fechaLimite: fechaLimite ?? metas[index].fechaLimite,
    descripcion: descripcion ?? metas[index].descripcion,
  };

  res.json(metas[index]);
});

// DELETE /metas/:id -> elimina una meta
app.delete("/metas/:id", (req, res) => {
  const id = Number(req.params.id);
  const existe = metas.some((m) => m.id === id);

  if (!existe) {
    return res.status(404).json({ error: "Meta no encontrada" });
  }

  metas = metas.filter((m) => m.id !== id);
  res.status(204).send();
});

// ---------------- API EXTERNA: Divisas ----------------

import fetch from "node-fetch";

// Usaremos una API gratuita rápida
// Ejemplo: https://api.exchangerate-api.com/v4/latest/USD

app.get("/divisas", async (req, res) => {
  try {
    const respuesta = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await respuesta.json();

    // Queremos USD y EUR en CLP
    const usdToClp = data.rates.CLP;
    const eurToClp = data.rates.CLP / data.rates.EUR;

    res.json({
      base: "USD",
      usd_clp: usdToClp,
      eur_clp: eurToClp,
    });
  } catch (err) {
    console.error("Error API externa:", err);
    res.status(500).json({ error: "No se pudo obtener tasas de cambio" });
  }
});





// ---------------- Endpoint de salud ----------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend MiGasto funcionando" });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor MiGasto escuchando en http://localhost:${PORT}`);
});
