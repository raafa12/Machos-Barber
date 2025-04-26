import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    getUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (!user) {
    return <Text style={styles.loading}>Cargando...</Text>;
  }

  // Lógica para mostrar diferentes opciones según el rol
  const renderAdminContent = () => {
    return (
      <View style={styles.adminContent}>
        <Text style={styles.roleInfo}>Eres un administrador</Text>
        <Button
          title="Gestionar Usuarios"
          onPress={() => Alert.alert('Aquí podrías gestionar los usuarios')}
        />
        <Button
          title="Gestionar Servicios"
          onPress={() => Alert.alert('Aquí podrías gestionar los servicios')}
        />
      </View>
    );
  };

  const renderClientContent = () => {
    return (
      <View style={styles.clientContent}>
        <Text style={styles.roleInfo}>Eres un cliente</Text>
        <Button
          title="Ver mis citas"
          onPress={() => Alert.alert('Aquí podrías ver tus citas')}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.info}>Nombre: {user.name}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Rol: {user.role}</Text>

      {/* Mostrar contenido según el rol */}
      {user.role === 'admin' ? renderAdminContent() : renderClientContent()}

      <Button title="Cerrar sesión" onPress={logout} color="#E63946" />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 18,
    marginBottom: 8,
  },
  roleInfo: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  adminContent: {
    marginTop: 20,
    backgroundColor: '#E9C8E1',
    padding: 10,
    borderRadius: 8,
  },
  clientContent: {
    marginTop: 20,
    backgroundColor: '#F1FAEE',
    padding: 10,
    borderRadius: 8,
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 18,
  },
});

