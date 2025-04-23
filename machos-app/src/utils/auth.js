import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar token JWT
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

// Obtener token JWT
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

// Eliminar token JWT (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};

// Obtener encabezado de autorización
export const getAuthHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Guardar datos del usuario
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error al guardar datos del usuario:', error);
  }
};

// Obtener datos del usuario
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

// Verificar si el usuario es admin
export const isAdmin = async () => {
  try {
    const userData = await getUserData();
    return userData && userData.role === 'admin';
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
};