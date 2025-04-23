const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Verifica si el usuario está autenticado
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtener el token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('No has iniciado sesión. Por favor inicia sesión para acceder.', 401));
  }

  // 2) Verificar el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Verificar si el usuario aún existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario de este token ya no existe.', 401));
  }

  // 4) Verificar si el usuario cambió su contraseña después de emitir el token
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('Usuario cambió su contraseña recientemente. Por favor inicia sesión de nuevo.', 401));
  }

  // Agregar el usuario a la solicitud
  req.user = currentUser;
  next();
});

// Restricción para ciertos roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para realizar esta acción', 403));
    }
    next();
  };
};
