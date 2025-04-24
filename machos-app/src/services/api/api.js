import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL del backend (si estás en el mismo dispositivo usa localhost)
});

export default api;
