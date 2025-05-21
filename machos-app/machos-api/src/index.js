// src/index.js (backend)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { authMiddleware, checkRole } = require('./middlewares/authMiddleware');

// Importar rutas
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

// Configuración de la aplicación
const app = express();

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:19006',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://192.168.1.9:19006',
  'http://192.168.1.9:3000',
  'http://192.168.1.9:5000',
  'http://localhost:8081',
  'http://localhost:8083',
  /^https?:\/\/192\.168\.1\.\d{1,3}(?::\d+)?$/,
  /^exp:\/\/192\.168\.1\.\d{1,3}(?::\d+)?$/,
  /^exp:\/\/.*\.exp\.direct.*$/,
  /^exp:\/\/.*\.exp\.expo.*$/
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está permitido
    const allowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (allowed) {
      callback(null, true);
    } else {
      console.warn('Origen no permitido por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));
app.use(express.json());

// Agregar cabeceras CORS manualmente para respuestas OPTIONS
app.options('*', cors(corsOptions));

// Logging de solicitudes para depuración
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/machos';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida correctamente');
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);

// Rutas protegidas de ejemplo
app.get('/api/private', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    message: `Hola ${req.user.name || req.user.role}, esta es una ruta protegida.`,
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Ruta protegida solo para administradores
app.get('/api/admin', authMiddleware, checkRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Acceso concedido al panel de administración',
    user: req.user
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API disponible en http://localhost:${PORT}/api`);
});

