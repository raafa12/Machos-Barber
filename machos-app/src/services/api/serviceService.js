// src/services/api/serviceService.js
import api from './api';

// Obtener todos los servicios disponibles
export const getServices = async () => {
  try {
    const response = await api.get('/services');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Para administradores: crear un nuevo servicio
export const createService = async (serviceData) => {
  try {
    const response = await api.post('/services', serviceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Para administradores: actualizar un servicio
export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Para administradores: eliminar un servicio
export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};