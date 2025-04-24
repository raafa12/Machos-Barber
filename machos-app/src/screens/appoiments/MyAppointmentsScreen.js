// src/screens/appointments/MyAppointmentsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserAppointments, cancelAppointment } from '../../services/api/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/dateUtils';

const MyAppointmentsScreen = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para cargar las reservas
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUserAppointments();
      // Ordenar citas por fecha, las próximas primero
      const sortedAppointments = data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
      setAppointments(sortedAppointments);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus reservas');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });
    return unsubscribe;
  }, [navigation]);

  // Refrescar la lista
  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Función para cancelar una reserva
  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await cancelAppointment(appointmentId);
              // Actualizar la lista después de cancelar
              loadAppointments();
              Alert.alert('Éxito', 'Tu reserva ha sido cancelada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
              console.error('Error canceling appointment:', error);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Determinar si una cita es cancelable (por ejemplo, con 24 horas de anticipación)
  const isCancelable = (appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    // 24 horas en milisegundos
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  // Renderizar cada item de la lista
  const renderAppointmentItem = ({ item }) => {
    const appointmentDate = new Date(`${item.date}T${item.time}`);
    const isPast = appointmentDate < new Date();
    
    return (
      <View style={[styles.appointmentCard, isPast && styles.pastAppointment]}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <View style={[
            styles.statusBadge, 
            item.status === 'confirmed' ? styles.confirmedBadge : 
            item.status === 'cancelled' ? styles.cancelledBadge :
            item.status === 'completed' ? styles.completedBadge : 
            styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'confirmed' ? 'Confirmada' : 
               item.status === 'cancelled' ? 'Cancelada' :
               item.status === 'completed' ? 'Completada' : 'Pendiente'}
            </Text>
          </View>
        </View>
        
        <View style={styles.appointmentInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>${item.servicePrice}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="hourglass-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.serviceDuration} min</Text>
          </View>
        </View>
        
        {!isPast && item.status !== 'cancelled' && isCancelable(item) && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Reservas</Text>
      
      <TouchableOpacity 
        style={styles.newAppointmentButton}
        onPress={() => navigation.navigate('NewAppointment')}
      >
        <Ionicons name="add-circle-outline" size={20} color="white" />
        <Text style={styles.newAppointmentButtonText}>Nueva Reserva</Text>
      </TouchableOpacity>
      
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes reservas programadas</Text>
          <Button 
            title="Reservar Ahora" 
            onPress={() => navigation.navigate('NewAppointment')}
          />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary,
  },
  newAppointmentButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  newAppointmentButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pastAppointment: {
    opacity: 0.7,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FFC107',
  },
  confirmedBadge: {
    backgroundColor: '#4CAF50',
  },
  cancelledBadge: {
    backgroundColor: '#F44336',
  },
  completedBadge: {
    backgroundColor: '#2196F3',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default MyAppointmentsScreen;