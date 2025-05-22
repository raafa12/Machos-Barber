// src/screens/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../constants';

// Definición de tipos para las propiedades del componente
type LoginScreenProps = {
  navigation: StackNavigationProp<any, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const { login } = auth;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Validación básica
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo o imagen */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MACHOS</Text>
            <Text style={styles.barberText}>BARBER</Text>
          </View>
          
          <Text style={styles.title}>Iniciar Sesión</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              placeholder="tu@email.com" 
              style={styles.input} 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput 
              placeholder="Tu contraseña" 
              secureTextEntry 
              style={styles.input} 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }} 
            />
          </View>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: colors.background
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary
  },
  barberText: {
    fontSize: 24,
    color: colors.text.secondary
  },
  title: { 
    fontSize: 28, 
    marginBottom: 20, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text.primary
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.text.primary,
    fontWeight: '500'
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.divider,
    backgroundColor: colors.card,
    padding: 12, 
    borderRadius: 8,
    fontSize: 16
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  loginButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold'
  },
  registerButton: {
    marginTop: 20,
    padding: 10
  },
  registerButtonText: {
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 16
  }
});

export default LoginScreen;
