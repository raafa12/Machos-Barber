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

      if (data && data.length > 0) {
        const sortedAppointments = data.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        });
        setAppointments(sortedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'No se pudieron cargar tus reservas. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadAppointments);
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
              loadAppointments(); // Refrescar la lista después de cancelar
              Alert.alert('Éxito', 'Tu reserva ha sido cancelada');
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva. Intenta nuevamente.');
            } finally {
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
  // Tu código de estilos
});

export default MyAppointmentsScreen;
