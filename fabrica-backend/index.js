require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
app.use(cors({origin:"https://suenodeangel.up.railway.app"}));
app.use(express.json());

// --- CONFIGURACIÓN DE NOTIFICACIONES ---
webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

// --- CONEXIÓN A BASE DE DATOS ---
// Asegúrate de que tu MONGO_URI en el .env termine con el nombre de la BD (ej: /test)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// --- MODELOS ---
const Pedido = mongoose.model('Pedido', new mongoose.Schema({
  planta: String,
  destino: String,
  productos: mongoose.Schema.Types.Mixed, // Permite guardar el objeto de cantidades flexible
  fecha: { type: Date, default: Date.now }
}));

// Este modelo guarda la "llave" del navegador de la oficina permanentemente
const Suscripcion = mongoose.model('Suscripcion', {
  endpoint: String,
  keys: Object,
  fechaRegistro: { type: Date, default: Date.now }
});

// --- RUTAS ---

// 1. Vincular Oficina (Guarda la suscripción en Atlas)
app.post('/api/suscribir-oficina', async (req, res) => {
  try {
    // Borramos suscripciones viejas para que solo haya una oficina activa
    await Suscripcion.deleteMany({}); 
    const nuevaSub = new Suscripcion(req.body);
    await nuevaSub.save();
    console.log("✅ Suscripción de oficina guardada en la base de datos");
    res.json({ okey: true });
  } catch (err) {
    console.error("❌ Error al guardar suscripción:", err);
    res.status(500).send (err);
  }
});

// 2. Recibir Pedidos de Planta y Notificar
app.post('/api/pedidos', async (req, res) => {
  try {
    // A. Guardar el pedido (Prioridad #1)
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    console.log("📦 Pedido guardado en Atlas");

    // B. Buscar la oficina registrada en la BD
    const subOficina = await Suscripcion.findOne();

    if (subOficina) {
      const payload = JSON.stringify({
        title: '🚚 ¡NUEVO PEDIDO!',
        message: `Carga completa para: ${req.body.destino || "SIN NOMBRE"}`,
      });

      // Intentamos notificar sin trancar el proceso si falla
      webpush.sendNotification(subOficina, payload).catch(async (err) => {
        console.error("⚠️ Error de notificación:", err.statusCode);
        // Si el error es 410 (Gone), la suscripción ya no existe, la borramos
        if (err.statusCode === 410) {
          await Suscripcion.deleteOne({ _id: subOficina._id });
          console.log("🗑️ Suscripción expirada eliminada de la BD");
        }
      });
    }

    res.status(201).json({ ok: true, mensaje: "Pedido recibido y procesado" });
  } catch (e) {
    console.error("❌ Error al procesar pedido:", e);
    res.status(500).json({ error: e.message });
  }
});

// 3. Obtener Historial para la Oficina
app.get('/api/pedidos', async (req, res) => {
  try {
    // Buscamos los últimos 20 pedidos para que la tabla esté llena
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ARRANCAR EL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});