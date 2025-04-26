// src/services/api/appointmentService.js
import api from './api'; // Importa la instancia base de axios

// Obtener todas las reservas del usuario logueado
export const getUserAppointments = async () => {
  try {
    const response = await api.get('/appointments/user');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener horarios disponibles para una fecha y duración de servicio
export const getAvailableTimeSlots = async (date, serviceDuration) => {
  try {
    const response = await api.get(`/appointments/available-slots`, {
      params: { date, duration: serviceDuration }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear una nueva reserva
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancelar una reserva
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener los detalles de una reserva específica
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Para administradores: obtener todas las reservas
export const getAllAppointments = async (filters = {}) => {
  try {
    const response = await api.get('/appointments/all', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAppointments = async () => {
  const res = await API.get('/appointments');
  return res.data;
};

// Para administradores: actualizar estado de una reserva
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};