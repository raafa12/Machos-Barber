// src/screens/HomeScreen.tsx
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import fetchClient from '../utils/fetchClient';
import { API_URL } from '../config';
import { colors } from '../constants';

// Interfaces para el tipado
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  active?: boolean;
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  userId: string;
  serviceId: string;
  serviceInfo?: Service;
  status?: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const auth = useContext(AuthContext);
  const { logout, userToken, userInfo } = auth;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string>('');

  // Datos simulados para desarrollo
  const MOCK_SERVICES: Service[] = [
    {
      id: '1',
      name: 'Corte de Cabello',
      price: 15,
      duration: 30,
      description: 'Corte de cabello clásico con tijeras y máquina',
      active: true
    },
    {
      id: '2',
      name: 'Afeitado Tradicional',
      price: 12,
      duration: 25,
      description: 'Afeitado con navaja y toalla caliente',
      active: true
    },
    {
      id: '3',
      name: 'Corte + Barba',
      price: 25,
      duration: 45,
      description: 'Combinación de corte de cabello y arreglo de barba',
      active: true
    },
    {
      id: '4',
      name: 'Arreglo de Barba',
      price: 10,
      duration: 20,
      description: 'Perfilado y recorte de barba',
      active: true
    }
  ];

  const MOCK_APPOINTMENTS: Appointment[] = [
    {
      id: '101',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
      startTime: '10:00',
      userId: '1',
      serviceId: '1',
      serviceInfo: MOCK_SERVICES[0],
      status: 'confirmed'
    },
    {
      id: '102',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // En 3 días
      startTime: '16:30',
      userId: '1',
      serviceId: '3',
      serviceInfo: MOCK_SERVICES[2],
      status: 'pending'
    }
  ];

  // Variable para activar el modo simulado durante el desarrollo
  const USE_MOCK_DATA = true;

  // Función para obtener los servicios disponibles
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Modo simulado para desarrollo y pruebas sin backend
      if (USE_MOCK_DATA) {
        console.log('Usando datos simulados para servicios');
        // Simular un pequeño retraso para mostrar el loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setServices(MOCK_SERVICES);
        setError('');
        setLoading(false);
        return;
      }
      
      // Código original para conexión con backend real
      console.log('Haciendo petición a:', `${API_URL}/services`);
      const response = await fetchClient.get('/services');
      console.log('Respuesta de la API:', response);
      console.log('Datos de servicios recibidos:', response.data);
      setServices(response.data);
      console.log('Estado de servicios actualizado:', response.data);
      setError('');
    } catch (error: any) {
      console.error('Error al obtener servicios:', error);
      console.error('Mensaje de error:', error.response?.data?.message || error.message);
      setError('No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las próximas citas del usuario
  const fetchUpcomingAppointments = async () => {
    if (!userToken) return;
    
    try {
      // Modo simulado para desarrollo y pruebas sin backend
      if (USE_MOCK_DATA) {
        console.log('Usando datos simulados para citas');
        // Simular un pequeño retraso para mostrar el loading
        await new Promise(resolve => setTimeout(resolve, 500));
        setUpcomingAppointments(MOCK_APPOINTMENTS);
        return;
      }
      
      // Código original para conexión con backend real
      const response = await fetchClient.get('/appointments/user');
      
      // Asegurarse de que response.data es un array antes de usar filter
      const appointments = Array.isArray(response.data) 
        ? response.data 
        : [];
        
      const upcoming = appointments.filter((app: Appointment) => 
        app && app.date && new Date(app.date) >= new Date()
      );
      
      setUpcomingAppointments(upcoming);
    } catch (error: any) {
      console.error('Error al obtener citas:', error);
      console.error('Mensaje de error:', error.response?.data?.message || error.message);
      
      // En modo simulado, mostramos datos simulados incluso en caso de error
      if (USE_MOCK_DATA) {
        setUpcomingAppointments(MOCK_APPOINTMENTS);
      } else {
        // Inicializar con array vacío en caso de error
        setUpcomingAppointments([]);
      }
    }
  };

  useEffect(() => {
    // Cargar datos al montar el componente
    fetchServices();
    fetchUpcomingAppointments();
  }, [userToken]);

  // Formato de fecha para mostrar
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Navegar a la pantalla de nueva cita con el servicio seleccionado
  const handleServicePress = (service: Service) => {
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
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
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
        <View style={styles.actionButtonsContainer}>
          {!userToken ? (
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Login')}
            >
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
    backgroundColor: colors.background
  },
  container: { 
    flex: 1,
    padding: 20,
    paddingBottom: 40
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  },
  // Estilos de secciones
  section: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text.primary
  },
  // Estilos de cabecera
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5,
    color: colors.text.primary
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 5,
  },
  // Estilos de bienvenida
  welcomeSection: {
    backgroundColor: colors.card,
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
    color: colors.text.primary
  },
  // Estilos de servicios
  servicesGrid: {
    width: '100%',
    paddingHorizontal: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: colors.card,
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
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  // Estilos de citas
  appointmentCard: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary
  },
  appointmentDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
    marginBottom: 10
  },
  // Estilos de botones
  actionButtonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.error,
  }
});

export default HomeScreen;
