import axios from 'axios';
import { API_URL } from '../config';
import { getAuthHeader } from '../utils/auth';

const availabilityApi = {
  // Obtener disponibilidad del estilista
  getStylistAvailability: async (stylistId = null) => {
    try {
      const headers = await getAuthHeader();
      const url = stylistId 
        ? `${API_URL}/availability/stylist/${stylistId}`
        : `${API_URL}/availability`;
      
      const response = await axios.get(url, { headers });
      return response.data.data.availability;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Crear o actualizar disponibilidad
  createUpdateAvailability: async (availabilityData) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${API_URL}/availability`, 
        availabilityData, 
        { headers }
      );
      return response.data.data.availability;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Eliminar disponibilidad
  deleteAvailability: async (availabilityId) => {
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${API_URL}/availability/${availabilityId}`, { headers });
      return true;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Crear una excepción (día libre)
  createException: async (exceptionData) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${API_URL}/availability/exception`, 
        exceptionData, 
        { headers }
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Obtener slots disponibles para una fecha
  getAvailableSlots: async (stylistId, date, serviceId = null) => {
    try {
      let url = `${API_URL}/availability/slots/${stylistId}?date=${date}`;
      if (serviceId) {
        url += `&serviceId=${serviceId}`;
      }
      
      const response = await axios.get(url);
      return response.data.data.slots;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  }
};

export default availabilityApi;