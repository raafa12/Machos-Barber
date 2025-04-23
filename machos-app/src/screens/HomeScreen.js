import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.navigate('Login');
        } else {
          const user = await AsyncStorage.getItem('user');
          setUser(JSON.parse(user));
        }
      } catch (error) {
        console.error(error);
        navigation.navigate('Login');
      }
    };
    fetchUserData();
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.navigate('Login');
  };

  return (
    <View>
      {user ? (
        <>
          <Text>Bienvenido, {user.name}!</Text>
          <Button title="Cerrar sesión" onPress={handleLogout} />
        </>
      ) : (
        <Text>Cargando...</Text>
      )}
    </View>
  );
};

export default HomeScreen;
