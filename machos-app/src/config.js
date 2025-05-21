// src/config.js

// Para desarrollo en emulador/simulador
const EMULATOR_API_URL = 'http://10.0.2.2:5000/api'; // Para emulador Android

// Para desarrollo en dispositivo físico o Expo Go
const LOCAL_API_URL = 'http://localhost:5000/api'; // Usar localhost para desarrollo local

// Para producción
const PRODUCTION_API_URL = 'https://tu-dominio-produccion.com/api';

// Determina qué URL usar basado en el entorno
export const API_URL = __DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL;

// Exportamos todas las URLs para poder cambiar fácilmente si es necesario
export const API_URLS = {
  EMULATOR: EMULATOR_API_URL,
  LOCAL: LOCAL_API_URL,
  PRODUCTION: PRODUCTION_API_URL
};
