// src/services/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

// Configuración global de axios
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para enviar cookies y encabezados de autenticación
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token de autenticación a las solicitudes
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no es una solicitud de reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar renovar el token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Guardar los nuevos tokens
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          // Reintentar la solicitud original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // Si hay un error al renovar el token, redirigir al login
        console.error('Error al renovar el token:', refreshError);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        // Aquí podrías redirigir al usuario al login
        // navigation.navigate('Login');
      }
    }
    
    // Para otros errores, simplemente rechazar la promesa
    return Promise.reject(error);
  }
);

export default API;


