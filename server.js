const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json()); // Para leer los datos que vienen del cel

// Conexión a tu Mongo Atlas (reemplaza con tu link)
mongoose.connect('mongodb+srv://admin:admin1234@clusterprueba.l2t7dwu.mongodb.net/?appName=clusterPrueba');

const Pedido = mongoose.model('Pedido', {
    despachador: String,
    productos: Array,
    status: { type: String, default: 'pendiente' },
    fecha: { type: Date, default: Date.now }
});

// Ruta para recibir el pedido desde planta
app.post('/nuevo-pedido', async (req, res) => {
    try {
        const nuevoPedido = new Pedido(req.body);
        await nuevoPedido.save();
        res.status(201).send({ mensaje: "Pedido guardado con éxito" });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));