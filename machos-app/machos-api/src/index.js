require('dotenv').config(); // Carga variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Rutas y middlewares
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Para parsear JSON en body de requests

// Variables de entorno
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peluqueria';

// Conectar a MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
})
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Ruta protegida de ejemplo
app.get('/api/private', authMiddleware, (req, res) => {
  res.json({
    message: `Hola ${req.user.role}, esta es una ruta protegida`,
    user: req.user
  });
});

