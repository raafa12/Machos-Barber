// src/screens/HomeScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { logout, userToken, userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [error, setError] = useState('');

  // Función para obtener los servicios disponibles
  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('Haciendo petición a:', `${API_URL}/services`);
      const response = await axios.get(`${API_URL}/services`);
      console.log('Respuesta de la API:', response);
      console.log('Datos de servicios recibidos:', response.data);
      setServices(response.data);
      console.log('Estado de servicios actualizado:', response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      if (error.response) {
        // La petición fue hecha y el servidor respondió con un status code
        console.error('Datos del error:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        console.error('No se recibió respuesta del servidor');
      } else {
        // Algo pasó al configurar la petición
        console.error('Error al configurar la petición:', error.message);
      }
      setError('No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las próximas citas del usuario
  const fetchUpcomingAppointments = async () => {
    if (!userToken) return;
    
    try {
      const response = await axios.get(`${API_URL}/appointments/user`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      
      // Asegurarse de que response.data es un array antes de usar filter
      const appointments = Array.isArray(response.data) 
        ? response.data 
        : [];
        
      const upcoming = appointments.filter(app => 
        app && app.date && new Date(app.date) >= new Date()
      );
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      } else {
        console.error('Error al configurar la petición:', error.message);
      }
      // Inicializar con array vacío en caso de error
      setUpcomingAppointments([]);
    }
  };

  useEffect(() => {
    // Cargar datos al montar el componente
    fetchServices();
    fetchUpcomingAppointments();
  }, [userToken]);

  // Formato de fecha para mostrar
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Navegar a la pantalla de nueva cita con el servicio seleccionado
  const handleServicePress = (service) => {
    navigation.navigate('NewAppointment', { selectedService: service });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Machos Barber 💈</Text>
          <Text style={styles.subtitle}>Tu barbería de confianza</Text>
        </View>
        
        {/* Mensaje de bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bienvenido{userInfo?.name ? `, ${userInfo.name}` : ''}! ¿Qué te gustaría hacer hoy?
          </Text>
        </View>

        {/* Próximas citas */}
        {userToken && upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus próximas citas</Text>
            {upcomingAppointments.map((appointment, index) => (
              <View key={index} style={styles.appointmentCard}>
                <Text style={styles.appointmentService}>{appointment.serviceInfo?.name || 'Servicio'}</Text>
                <Text style={styles.appointmentDate}>{formatDate(appointment.date)} - {appointment.startTime}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestros servicios</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.servicesGrid}>
              {services.filter(service => service.active !== false).map((service, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service)}
                >
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>{service.price}€</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          {!userToken ? (
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={logout}
            >
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  loader: {
    marginVertical: 20,
  },
  servicesGrid: {
    width: '100%',
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
    minWidth: 150,
  },
  serviceContent: {
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  servicesGrid: {
    width: '100%',
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appointmentDate: {
    color: '#666',
  },
  welcomeSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  container: { 
    flex: 1,
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  welcomeText: {
    fontSize: 18,
    color: '#333'
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  appointmentCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10
  },
  smallButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start'
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center'
  },
  serviceImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  servicePrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold'
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666'
  },
  actionButtons: {
    marginTop: 10
  },
  button: { 
    backgroundColor: '#000', 
    padding: 15, 
    borderRadius: 8, 
    marginVertical: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  logoutButton: { 
    backgroundColor: '#ff3b30' 
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  }
});

export default HomeScreen;
