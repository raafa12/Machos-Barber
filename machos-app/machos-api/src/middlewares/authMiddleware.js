// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Obtener el secreto del JWT desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

// Si no hay un JWT_SECRET definido en producción, mostrar una advertencia
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secreto123')) {
  console.warn('⚠️ ADVERTENCIA: Estás usando un JWT_SECRET por defecto en producción. Esto es inseguro.');
  console.warn('Por favor, configura una variable de entorno JWT_SECRET con un valor seguro y único.');
}

/**
 * Middleware de autenticación
 * Verifica el token JWT y adjunta la información del usuario a la solicitud
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si se proporcionó un encabezado de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. No se proporcionó token de autenticación.' 
      });
    }
    
    // Verificar si el encabezado tiene el formato correcto
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Formato de token inválido. Debe ser: Bearer [token]' 
      });
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token vacío o inválido' 
      });
    }
    
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verificar si el usuario aún existe en la base de datos
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'El usuario asociado a este token ya no existe'
        });
      }
      
      // Adjuntar la información del usuario a la solicitud
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'El token ha expirado. Por favor, inicia sesión nuevamente.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Por favor, inicia sesión nuevamente.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Error de autenticación',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante la autenticación'
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {string[]} roles - Array de roles permitidos
 * @returns {Function} Middleware
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Verificar si el middleware de autenticación se ejecutó primero
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración: el middleware de autenticación debe ejecutarse primero'
      });
    }
    
    // Verificar si el usuario tiene uno de los roles permitidos
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No tienes permisos suficientes.'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  checkRole
};

