// src/utils/fetchClient.ts
// Una implementación de cliente HTTP basada en fetch nativo
// que proporciona una API similar a Axios pero sin dependencias externas

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Definimos la constante para el token directamente aquí para evitar problemas de importación
const TOKEN_STORAGE_KEY = 'authToken';

// Implementamos getToken directamente aquí para evitar dependencias circulares
async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
}

interface ResponseError extends Error {
  response?: {
    status: number;
    data: any;
    headers: Record<string, string>;
  };
}

interface RequestConfig {
  headers?: Record<string, string>;
  [key: string]: any;
}

// Función para manejar respuestas de fetch
const handleResponse = async (response: Response): Promise<any> => {
  // Verificar si la respuesta es exitosa (código 2xx)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Error HTTP: ${response.status} ${response.statusText}`
    }));
    
    // Crear un objeto de error similar al de Axios para mantener compatibilidad
    const error = new Error(errorData.message || 'Error en la petición') as ResponseError;
    error.response = {
      status: response.status,
      data: errorData,
      headers: Object.fromEntries(response.headers.entries())
    };
    throw error;
  }
  
  // Para respuestas vacías (como en DELETE)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Función para obtener los headers estándar
const getHeaders = async (customHeaders: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders
  };
};

// Cliente HTTP basado en fetch nativo
const fetchClient = {
  // Método GET
  get: async (url: string, config: RequestConfig = {}): Promise<any> => {
    try {
      const headers = await getHeaders(config.headers);
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        ...config
      });
      
      return {
        data: await handleResponse(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Método POST
  post: async (url: string, data: any = {}, config: RequestConfig = {}): Promise<any> => {
    try {
      const headers = await getHeaders(config.headers);
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...config
      });
      
      return {
        data: await handleResponse(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Método PUT
  put: async (url: string, data: any = {}, config: RequestConfig = {}): Promise<any> => {
    try {
      const headers = await getHeaders(config.headers);
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        ...config
      });
      
      return {
        data: await handleResponse(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Método DELETE
  delete: async (url: string, config: RequestConfig = {}): Promise<any> => {
    try {
      const headers = await getHeaders(config.headers);
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers,
        ...config
      });
      
      return {
        data: await handleResponse(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Método PATCH
  patch: async (url: string, data: any = {}, config: RequestConfig = {}): Promise<any> => {
    try {
      const headers = await getHeaders(config.headers);
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        ...config
      });
      
      return {
        data: await handleResponse(response),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      throw error;
    }
  }
};

// Exportar como objeto por defecto para mantener compatibilidad con la forma de uso de Axios
export default fetchClient;
