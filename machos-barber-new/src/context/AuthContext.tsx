// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchClient from '../utils/fetchClient';

// Constante para el nombre del token en AsyncStorage
const TOKEN_STORAGE_KEY = 'authToken';

// Tipos para el contexto
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  userToken: string | null;
  userInfo: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Crear el contexto con valor por defecto
export const AuthContext = createContext<AuthContextType>({
  login: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  userToken: null,
  userInfo: null,
  loading: true,
  isAuthenticated: false
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Variable para activar el modo simulado durante el desarrollo
  const USE_MOCK_DATA = true;

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      // Modo simulado para desarrollo y pruebas sin backend
      if (USE_MOCK_DATA) {
        console.log('Usando modo simulado para login');
        
        // Simular verificación básica de credenciales
        if (email === 'test@example.com' && password === 'password') {
          // Crear token simulado
          const mockToken = 'mock-jwt-token-' + new Date().getTime();
          
          // Crear usuario simulado
          const mockUser: User = {
            id: '1',
            name: 'Usuario de Prueba',
            email: 'test@example.com',
            role: 'user'
          };
          
          // Guardar datos simulados
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
          await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
          
          // Actualizar estado
          setUserInfo(mockUser);
          setUserToken(mockToken);
          
          return { success: true, user: mockUser };
        } else {
          // Simular error de credenciales inválidas
          return { 
            success: false, 
            error: 'Credenciales inválidas. Para el modo de prueba, usa test@example.com / password' 
          };
        }
      }
      
      // Código original para conexión con backend real
      const response = await fetchClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Guardar token y datos del usuario
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (user) {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUserInfo(user);
      }
      
      setUserToken(token);
      return { success: true, user };
    } catch (error: any) {
      console.error('Error de login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error de inicio de sesión' 
      };
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (name: string, email: string, password: string) => {
    try {
      // Modo simulado para desarrollo y pruebas sin backend
      if (USE_MOCK_DATA) {
        console.log('Usando modo simulado para registro');
        
        // Simular verificación de email existente
        if (email === 'test@example.com') {
          return { 
            success: false, 
            error: 'Este email ya está registrado. Prueba con otro email.' 
          };
        }
        
        // Simular registro exitoso
        return { 
          success: true, 
          message: 'Registro exitoso. Ahora puedes iniciar sesión con tus credenciales.' 
        };
      }
      
      // Código original para conexión con backend real
      const response = await fetchClient.post('/auth/register', { name, email, password });
      return { success: true, message: response.data?.message || 'Registro exitoso' };
    } catch (error: any) {
      console.error('Error de registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error de registro' 
      };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cargar token y datos del usuario al iniciar la app
  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const userData = await AsyncStorage.getItem('userData');
      
      if (token) {
        setUserToken(token);
      }
      
      if (userData) {
        setUserInfo(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error al cargar datos de usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      login, 
      logout, 
      register, 
      userToken, 
      userInfo,
      loading,
      isAuthenticated: !!userToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
