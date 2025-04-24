// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  const login = async (email, password) => {
    const res = await axios.post('http://<TU-IP>:5000/api/auth/login', { email, password });
    const token = res.data.token;
    await AsyncStorage.setItem('userToken', token);
    setUserToken(token);
  };

  const register = async (name, email, password) => {
    await axios.post('http://<TU-IP>:5000/api/auth/register', { name, email, password });
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
