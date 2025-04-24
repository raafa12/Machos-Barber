// src/screens/HomeScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const HomeScreen = () => {
  const { logout, userToken } = useContext(AuthContext);
  const [privateMessage, setPrivateMessage] = useState('');

  const fetchProtectedData = async () => {
    try {
      const res = await axios.get('http://<TU-IP>:5000/api/private', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setPrivateMessage(res.data.message);
    } catch {
      setPrivateMessage('Error al acceder a la ruta protegida');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido 💈</Text>
      <Button title="Ruta protegida" onPress={fetchProtectedData} />
      <Text style={styles.message}>{privateMessage}</Text>
      <Button title="Cerrar sesión" onPress={logout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  message: { marginTop: 20, fontSize: 16 }
});

export default HomeScreen;

