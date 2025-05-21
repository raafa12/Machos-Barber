// src/screens/RegisterScreen.js
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
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Validación básica
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    // Validación de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await register(name, email, password);
      
      if (result.success) {
        Alert.alert(
          'Registro exitoso', 
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al registrar usuario. Intenta nuevamente.');
      console.error('Register error:', err);
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
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MACHOS</Text>
            <Text style={styles.barberText}>BARBER</Text>
          </View>
          
          <Text style={styles.title}>Crear Cuenta</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              placeholder="Tu nombre" 
              style={styles.input} 
              value={name} 
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
            />
          </View>
          
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput 
              placeholder="Confirma tu contraseña" 
              secureTextEntry 
              style={styles.input} 
              value={confirmPassword} 
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>CREAR CUENTA</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    backgroundColor: '#f5f5f5'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000'
  },
  barberText: {
    fontSize: 22,
    color: '#555'
  },
  title: { 
    fontSize: 28, 
    marginBottom: 20, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  },
  errorText: {
    color: '#ff3b30',
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
    color: '#333',
    fontWeight: '500'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12, 
    borderRadius: 8,
    fontSize: 16
  },
  registerButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginButton: {
    marginTop: 20,
    padding: 10
  },
  loginButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16
  }
});

export default RegisterScreen;
