import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import AvailabilityService from '../services/availability.service';
import { useAuth } from '../context/AuthContext';
import TimeSlotModal from '../components/TimeSlotModal';
import BlockTimeModal from '../components/BlockTimeModal';
import TimeSlotItem from '../components/TimeSlotItem';

const AvailabilityManagementScreen = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  
  // Formatear fecha para la API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Formatear fecha para la visualización
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Cargar disponibilidad del día seleccionado
  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const data = await AvailabilityService.getAvailabilityByDate(selectedDate);
      
      // Ordenar por hora de inicio
      const sortedData = data.sort((a, b) => {
        return new Date(`${formattedDate}T${a.startTime}`) - new Date(`${formattedDate}T${b.startTime}`);
      });
      
      setAvailabilities(sortedData);
      updateMarkedDates();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la disponibilidad');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar fechas marcadas en el calendario
  const updateMarkedDates = async () => {
    try {
      // En un escenario real, obtendríamos todas las fechas con disponibilidad
      // para marcarlas en el calendario
      const currentDate = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(currentDate.getDate() + 30);
      
      let markedDatesObj = {};
      
      // Marcar la fecha seleccionada
      const formattedSelectedDate = formatDateForAPI(selectedDate);
      markedDatesObj[formattedSelectedDate] = { selected: true, selectedColor: '#2196F3' };
      
      setMarkedDates(markedDatesObj);
    } catch (error) {
      console.error('Error al actualizar fechas marcadas:', error);
    }
  };

  // Guardar una disponibilidad (crear o actualizar)
  const handleSaveAvailability = async (availabilityData) => {
    setIsLoading(true);
    try {
      if (editingAvailability) {
        // Actualizar existente
        await AvailabilityService.updateAvailability(
          editingAvailability._id, 
          {
            ...availabilityData,
            date: formatDateForAPI(selectedDate)
          }
        );
        Alert.alert('Éxito', 'Disponibilidad actualizada correctamente');
      } else {
        // Crear nueva
        await AvailabilityService.createAvailability({
          ...availabilityData,
          date: formatDateForAPI(selectedDate),
          barberId: user._id
        });
        Alert.alert('Éxito', 'Disponibilidad creada correctamente');
      }
      setModalVisible(false);
      loadAvailability();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la disponibilidad');
    } finally {
      setIsLoading(false);
    }
  };

  // Bloquear un horario
  const handleBlockTime = async (blockData) => {
    setIsLoading(true);
    try {
      await AvailabilityService.blockTimeSlot({
        ...blockData,
        date: formatDateForAPI(selectedDate),
        barberId: user._id
      });
      Alert.alert('Éxito', 'Horario bloqueado correctamente');
      setBlockModalVisible(false);
      loadAvailability();
    } catch (error) {
      Alert.alert('Error', 'No se pudo bloquear el horario');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar una disponibilidad
  const handleDeleteAvailability = async (availabilityId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta disponibilidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AvailabilityService.deleteAvailability(availabilityId);
              Alert.alert('Éxito', 'Disponibilidad eliminada correctamente');
              loadAvailability();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la disponibilidad');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Editar una disponibilidad existente
  const handleEditAvailability = (availability) => {
    setEditingAvailability(availability);
    setModalVisible(true);
  };

  // Cargar disponibilidad cuando cambia la fecha seleccionada
  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Disponibilidad</Text>
      
      {/* Calendario */}
      <Calendar
        current={formatDateForAPI(selectedDate)}
        minDate={formatDateForAPI(new Date())}
        onDayPress={(day) => {
          const newDate = new Date(day.year, day.month - 1, day.day);
          setSelectedDate(newDate);
        }}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#2196F3',
          todayTextColor: '#2196F3',
          arrowColor: '#2196F3',
        }}
      />
      
      {/* Fecha seleccionada */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>
          {formatDateForDisplay(selectedDate)}
        </Text>
      </View>
      
      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton]}
          onPress={() => {
            setEditingAvailability(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.buttonText}>Añadir Disponibilidad</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.blockButton]}
          onPress={() => setBlockModalVisible(true)}
        >
          <Ionicons name="time" size={20} color="white" />
          <Text style={styles.buttonText}>Bloquear Horario</Text>
        </TouchableOpacity>
      </View>
      
      {/* Lista de disponibilidades */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <ScrollView style={styles.availabilityList}>
          {availabilities.length === 0 ? (
            <Text style={styles.noDataText}>
              No hay horarios disponibles para esta fecha
            </Text>
          ) : (
            availabilities.map((availability) => (
              <TimeSlotItem
                key={availability._id}
                availability={availability}
                onEdit={() => handleEditAvailability(availability)}
                onDelete={() => handleDeleteAvailability(availability._id)}
                isBlocked={availability.isBlocked}
              />
            ))
          )}
        </ScrollView>
      )}
      
      {/* Modal para añadir/editar disponibilidad */}
      <TimeSlotModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingAvailability(null);
        }}
        onSave={handleSaveAvailability}
        availability={editingAvailability}
      />
      
      {/* Modal para bloquear horario */}
      <BlockTimeModal
        visible={blockModalVisible}
        onClose={() => setBlockModalVisible(false)}
        onSave={handleBlockTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  dateHeader: {
    marginVertical: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  blockButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  availabilityList: {
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 32,
  },
  loader: {
    marginTop: 32,
  },
});

export default AvailabilityManagementScreen;