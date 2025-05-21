import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from '../utils/auth';

const serviceApi = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      console.log('Obteniendo servicios de:', `${API_URL}/services`);
      const response = await axios.get(`${API_URL}/services`);
      console.log('Respuesta de la API (services):', response.data);
      // La respuesta puede ser directamente el array o estar dentro de data
      return Array.isArray(response.data) ? response.data : (response.data.data?.services || response.data.data || response.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw error.response ? error.response.data : error.message;
    }
  },

  // Obtener un servicio por ID
  getService: async (serviceId) => {
    try {
      const response = await axios.get(`${API_URL}/services/${serviceId}`);
      return response.data.data.service;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Crear un nuevo servicio (solo admin)
  createService: async (serviceData) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.post(`${API_URL}/services`, serviceData, { headers });
      return response.data.data.service;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Actualizar un servicio (solo admin)
  updateService: async (serviceId, serviceData) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.put(`${API_URL}/services/${serviceId}`, serviceData, { headers });
      return response.data.data.service;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Eliminar un servicio (solo admin)
  deleteService: async (serviceId) => {
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API_URL}/services/${serviceId}`, { headers });
      return true;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Desactivar un servicio (solo admin)
  deactivateService: async (serviceId) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.patch(`${API_URL}/services/${serviceId}/deactivate`, {}, { headers });
      return response.data.data.service;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Activar un servicio (solo admin)
  activateService: async (serviceId) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.patch(`${API_URL}/services/${serviceId}/activate`, {}, { headers });
      return response.data.data.service;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

export default serviceApi;