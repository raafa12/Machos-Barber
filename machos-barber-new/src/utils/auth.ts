import AsyncStorage from '@react-native-async-storage/async-storage';

// Constante para el nombre del token en AsyncStorage (misma que en AuthContext)
const TOKEN_STORAGE_KEY = 'authToken';

/**
 * Guardar token JWT
 * @param token - Token JWT a guardar
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

/**
 * Obtener token JWT
 * @returns Token JWT o null si no existe
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

/**
 * Eliminar token JWT (logout)
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};

/**
 * Obtener encabezado de autorización para peticiones HTTP
 * @returns Objeto con el encabezado de autorización
 */
export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Guardar datos del usuario
 * @param userData - Datos del usuario a guardar
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error al guardar datos del usuario:', error);
  }
};

/**
 * Obtener datos del usuario
 * @returns Datos del usuario o null si no existen
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

/**
 * Verificar si el usuario es administrador
 * @returns true si el usuario es admin, false en caso contrario
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();
    return userData && userData.role === 'admin';
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
};

/**
 * Verificar si el usuario está autenticado
 * @returns true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};
