import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import serviceApi from '../services/serviceApi';
import { isAdmin } from '../utils/auth';
import { formatCurrency } from '../utils/formatters';

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    loadServices();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const admin = await isAdmin();
    setUserIsAdmin(admin);
  };

  const loadServices = useCallback(async () => {
    console.log('Iniciando carga de servicios...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Obteniendo servicios de la API...');
      const response = await serviceApi.getAllServices();
      console.log('Respuesta de la API (services):', response);
      
      // Asegurarse de que los datos sean un array
      let servicesData = [];
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && response.data) {
        servicesData = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      console.log('Servicios procesados:', servicesData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('Error al cargar los servicios. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleServicePress = (service) => {
    // Navegar a la pantalla de nueva cita con el servicio seleccionado
    navigation.navigate('NewAppointment', { selectedService: service });
  };

  const handleAddService = () => {
    navigation.navigate('ServiceForm', { onServiceAdded: loadServices });
  };

  const handleEditService = (service) => {
    navigation.navigate('ServiceForm', { 
      service, 
      onServiceUpdated: loadServices 
    });
  };

  const confirmDelete = (serviceId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => handleDeleteService(serviceId)
        }
      ]
    );
  };

  const handleDeleteService = async (serviceId) => {
    try {
      setLoading(true);
      await serviceApi.deleteService(serviceId);
      loadServices();
      Alert.alert('Éxito', 'Servicio eliminado correctamente');
    } catch (err) {
      setError('No se pudo eliminar el servicio');
      Alert.alert('Error', 'No se pudo eliminar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceItem}
      onPress={() => handleServicePress(item)}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/100' }} 
        style={styles.serviceImage} 
      />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.servicePrice}>
            {formatCurrency(item.price)}
          </Text>
          <Text style={styles.serviceDuration}>
            {item.duration} min
          </Text>
        </View>
      </View>
      
      {userIsAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditService(item)}
          >
            <Ionicons name="pencil" size={18} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => confirmDelete(item._id)}
          >
            <Ionicons name="trash" size={18} color="#dc3545" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Nuestros Servicios</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : error ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <TouchableOpacity 
                key={service._id || index}
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
        
        {userIsAdmin && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddService}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
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
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#212529',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#28a745',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6c757d',
  },
  adminActions: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {},
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    padding: 20,
  }
});

export default ServicesScreen;