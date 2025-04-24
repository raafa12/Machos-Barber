// src/screens/admin/AppointmentManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { getAllAppointments, updateAppointmentStatus } from '../../services/api/appointmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/dateUtils';

const AppointmentManagementScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Opciones de filtro por estado
  const statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Confirmadas', value: 'confirmed' },
    { label: 'Canceladas', value: 'cancelled' },
    { label: 'Completadas', value: 'completed' },
  ];

  // Función para cargar las reservas
  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Crear filtros para la API
      const filters = {};
      if (filterDate) {
        const formattedDate = filterDate.toISOString().split('T')[0];
        filters.date = formattedDate;
      }
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const data = await getAllAppointments(filters);
      // Ordenar por hora
      const sortedAppointments = data.sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
      setAppointments(sortedAppointments);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar las reservas al montar el componente o cuando cambian los filtros
  useEffect(() => {
    loadAppointments();
  }, [filterDate, statusFilter]);

  // Función para cambiar el estado de una reserva
  const handleStatusChange = (appointmentId, newStatus) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Deseas cambiar el estado de esta reserva a "${
        newStatus === 'confirmed' ? 'Confirmada' :
        newStatus === 'completed' ? 'Completada' :
        newStatus === 'cancelled' ? 'Cancelada' : 'Pendiente'
      }"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              setLoading(true);
              await updateAppointmentStatus(appointmentId, newStatus);
              await loadAppointments(); // Recargar las reservas
              Alert.alert('Éxito', 'Estado de la reserva actualizado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado');
              console.error('Error updating status:', error);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Manejar cambio de fecha
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  // Función para renderizar cada reserva
  const renderAppointmentItem = ({ item }) => {
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.timeText}>{item.time}</Text>
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
        
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        
        <View style={styles.clientInfo}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{item.userName}</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Duración:</Text>
            <Text style={styles.value}>{item.serviceDuration} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Precio:</Text>
            <Text style={styles.value}>${item.servicePrice}</Text>
          </View>
          </View>
        
        {/* Botones de acción para cambiar estado */}
        <View style={styles.actionsContainer}>
          {item.status !== 'confirmed' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleStatusChange(item._id, 'confirmed')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
          
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange(item._id, 'completed')}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Completar</Text>
            </TouchableOpacity>
          )}
          
          {item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusChange(item._id, 'cancelled')}
            >
              <Ionicons name="close-circle-outline" size={16} color="white" />
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Función para refrescar la lista
  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Reservas</Text>
      
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dateText}>
            {filterDate ? formatDate(filterDate.toISOString().split('T')[0]) : 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={filterDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        
        <View style={styles.statusFilterContainer}>
          <DropDownPicker
            open={statusDropdownOpen}
            setOpen={setStatusDropdownOpen}
            value={statusFilter}
            setValue={setStatusFilter}
            items={statusOptions}
            placeholder="Filtrar por estado"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
      </View>
      
      {/* Lista de reservas */}
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reservas para esta fecha</Text>
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
  filtersContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '500',
  },
  statusFilterContainer: {
    zIndex: 5000,
    marginBottom: 12,
  },
  dropdown: {
    borderColor: '#ddd',
  },
  dropdownContainer: {
    borderColor: '#ddd',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
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
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  clientInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
  },
  label: {
    fontWeight: '500',
    color: '#666',
    marginRight: 4,
  },
  value: {
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AppointmentManagementScreen;