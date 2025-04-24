const admin = require('firebase-admin');

// Inicializar Firebase Admin (asumiendo que ya tienes configuradas las credenciales en el proyecto)
// Si no lo has configurado aún, necesitarás un archivo de credenciales de Firebase
// y deberás inicializarlo en tu archivo principal (server.js o app.js)

/**
 * Envía una notificación push a un dispositivo específico
 * @param {string} token - Token FCM del dispositivo
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {Object} data - Datos adicionales (opcional)
 * @returns {Promise} - Promesa con el resultado del envío
 */
exports.sendNotification = async (token, title, body, data = {}) => {
  try {
    if (!token) {
      throw new Error('Token de dispositivo no proporcionado');
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación enviada correctamente:', response);
    return response;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
};

/**
 * Envía una notificación a múltiples dispositivos
 * @param {Array<string>} tokens - Lista de tokens FCM
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {Object} data - Datos adicionales (opcional)
 * @returns {Promise} - Promesa con el resultado del envío
 */
exports.sendMulticastNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!tokens || tokens.length === 0) {
      throw new Error('No se proporcionaron tokens válidos');
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Notificación enviada a ${response.successCount} dispositivos`);
    return response;
  } catch (error) {
    console.error('Error al enviar notificación multicast:', error);
    throw error;
  }
};