// src/navigation/Navigation.js
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { AuthContext } from '../context/AuthContext';
import ServicesScreen from '../screens/ServicesScreen';
import NewAppointmentScreen from '../screens/appoiments/NewAppointmentScreen';
import MyAppointmentsScreen from '../screens/appoiments/MyAppointmentsScreen';
import MainTabs from './MainTabs';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        {userToken ? (
          // Rutas autenticadas
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Services" 
              component={ServicesScreen} 
              options={{ title: 'Servicios' }}
            />
            <Stack.Screen 
              name="NewAppointment" 
              component={NewAppointmentScreen} 
              options={{ title: 'Nueva Cita' }}
            />
            <Stack.Screen 
              name="MyAppointments" 
              component={MyAppointmentsScreen} 
              options={{ title: 'Mis Citas' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Mi Perfil' }}
            />
          </>
        ) : (
          // Rutas no autenticadas
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Registro' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;


