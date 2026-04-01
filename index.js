require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');

const app = express(); // 1. Primero creamos la app
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE NOTIFICACIONES ---
// Esto usa las llaves que guardaste en el archivo .env
webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

let suscripcionOficina = null; // Aquí guardamos el "ID" del teléfono de la oficina

// --- CONEXIÓN A BASE DE DATOS ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Definimos el modelo de los Pedidos
const Pedido = mongoose.model('Pedido', {
  planta: String,
  productos: Object, // Cambiado a Object para que guarde bien las cantidades
  fecha: { type: Date, default: Date.now }
});

// --- RUTAS (Las órdenes del servidor) ---

// 1. Ruta para que la oficina se registre
app.post('/api/suscribir-oficina', (req, res) => {
  suscripcionOficina = req.body;
  console.log("✅ Teléfono de la oficina registrado y listo para avisos");
  res.status(201).json({ mensaje: "Oficina vinculada" });
});

// 2. Ruta para recibir pedidos de planta y AVISAR a la oficina
app.post('/api/pedidos', async (req, res) => {
  try {
    // Primero: Guardamos en la base de datos (MongoDB)
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    console.log("📦 Pedido guardado en la base de datos");

    // Segundo: Si la oficina está registrada, le mandamos el zumbido
    if (suscripcionOficina) {
      const payload = JSON.stringify({
        title: '🚚 ¡NUEVO PEDIDO!',
        message: `Llegó un despacho de: ${req.body.planta}`
      });

      webpush.sendNotification(suscripcionOficina, payload).catch(err => console.error(err));
        
    }

    res.status(201).json({ ok: true, mensaje: "Pedido recibido y notificado" });

  } catch (e) { res.status(500).send(e);}
});

// --- ARRANCAR EL SERVIDOR ---
const PORT = process.env.PORT || 3000;
// Ruta para que la oficina pida la lista de pedidos
app.get('/api/pedidos', async (req, res) => {
  try {
    // Buscamos los últimos 10 pedidos, ordenados del más nuevo al más viejo
    const pedidos = await Pedido.find().sort({ fecha: -1 }).limit(10);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});