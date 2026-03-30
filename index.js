require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Aquí conectaremos tu MongoDB Atlas después
const MONGO_URI = process.env.MONGO_URI || 'TU_LINK_DE_MONGO_AQUI';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Definimos qué datos vamos a guardar de cada despacho
const Pedido = mongoose.model('Pedido', {
  planta: String,
  productos: Array,
  fecha: { type: Date, default: Date.now }
});

// Ruta para que los teléfonos de planta envíen el pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    res.status(201).json({ ok: true, mensaje: "Pedido recibido en oficina" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en el puerto ${PORT}`));