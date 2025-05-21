import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './src/navigation/Navigation';
import 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';


export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo verificamos si se ha cargado la aplicación
    const init = async () => {
      // Simulamos un tiempo de carga para mostrar la pantalla de splash
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}


