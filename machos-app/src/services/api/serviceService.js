import API from './api';

export const fetchServices = async () => {
  const res = await API.get('/services');
  return res.data;
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