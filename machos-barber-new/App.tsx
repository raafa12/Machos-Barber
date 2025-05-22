import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importaciones fundamentales para React Navigation
import 'react-native-gesture-handler';

// Importaciones locales
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { colors } from './src/constants';

// Importar pantallas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

// Definir tipos para los stacks de navegación
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type AppStackParamList = {
  Home: undefined;
  Appointments: undefined;
  NewAppointment: undefined;
  Profile: undefined;
};

// Crear stacks de navegación
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

// Navegación para usuarios no autenticados
const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ 
        title: 'Iniciar Sesión',
        headerShown: false
      }}
    />
    <AuthStack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ 
        title: 'Crear Cuenta',
        headerShown: false
      }}
    />
  </AuthStack.Navigator>
);

// Navegación para usuarios autenticados
const AppNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Machos Barber' }}
    />
  </AppStack.Navigator>
);

// Componente principal para manejar la navegación según el estado de autenticación
const RootNavigator = () => {
  const auth = useContext(AuthContext);
  const { userToken, loading } = auth;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Componente principal de la aplicación
export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
});
