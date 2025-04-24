// src/index.js (backend)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authMiddleware = require('./middlewares/authMiddleware');

// ...tu conexión a MongoDB y configuraciones ya existentes

const app = express();
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', require('./routes/auth'));

// 👉 Ruta protegida
app.get('/api/private', authMiddleware, (req, res) => {
  res.json({ message: `Hola ${req.user.role}, esta es una ruta protegida.` });
});

// Inicia el servidor
app.listen(process.env.PORT || 5000, () => {
  console.log('🚀 Servidor corriendo en puerto 5000');
});


