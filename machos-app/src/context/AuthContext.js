// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.token;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error de inicio de sesión' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error de registro' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  const loadToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) setUserToken(token);
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};
