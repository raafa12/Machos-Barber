// src/navigation/Navigation.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;


