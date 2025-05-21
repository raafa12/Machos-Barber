// src/screens/appointments/NewAppointmentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { createAppointment, getAvailableTimeSlots } from '../../services/api/appointmentService';
import serviceApi from '../../services/serviceApi';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';

const NewAppointmentScreen = ({ route }) => {
  const navigation = useNavigation();
  const { selectedService: preSelectedService } = route.params || {};

  // Estados
  const [selectedDate, setSelectedDate] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  // Cargar los servicios disponibles al montar el componente
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await serviceApi.getAllServices();
        const servicesData = Array.isArray(response) ? response : (response.data || []);
        
        // Filtrar solo servicios activos y formatear para el dropdown
        const formattedServices = servicesData
          .filter(service => service.active !== false)
          .map(service => ({
            label: `${service.name} - ${service.price}€ (${service.duration} min)`,
            value: service._id,
            ...service
          }));
        
        setServices(formattedServices);
        
        // Si hay un servicio preseleccionado, establecerlo
        if (preSelectedService) {
          const serviceToSelect = formattedServices.find(
            s => s._id === preSelectedService._id || s.name === preSelectedService.name
          );
          if (serviceToSelect) {
            setSelectedService(serviceToSelect.value);
            // Cerrar el dropdown después de seleccionar
            setServiceDropdownOpen(false);
          }
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los servicios disponibles');
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [preSelectedService]);

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDate || !selectedService) return;

      
      try {
        setLoading(true);
        // Obtener slots disponibles considerando la duración del servicio
        const slots = await getAvailableTimeSlots(selectedDate, selectedService.duration);
        
        // Formatear los slots para el dropdown
        const formattedSlots = slots.map(slot => ({
          label: slot,
          value: slot
        }));
        
        setAvailableTimeSlots(formattedSlots);
        // Reiniciar el slot seleccionado
        setSelectedTimeSlot(null);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
        console.error('Error loading time slots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeSlots();
  }, [selectedDate, selectedService]);

  // Función para manejar la selección de fecha
  const handleDateSelect = (day) => {
    // Verificar que la fecha seleccionada no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(day.dateString);
    
    if (selectedDay < today) {
      Alert.alert('Fecha inválida', 'No puedes seleccionar una fecha pasada');
      return;
    }
    
    setSelectedDate(day.dateString);
  };

  // Función para crear la reserva
  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedService || !selectedTimeSlot) {
      Alert.alert('Información incompleta', 'Por favor selecciona fecha, servicio y hora');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        date: selectedDate,
        time: selectedTimeSlot,
        serviceId: selectedService.value,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        servicePrice: selectedService.price
      };
      
      await createAppointment(appointmentData);
      Alert.alert(
        'Reserva exitosa', 
        'Tu cita ha sido programada correctamente',
        [{ text: 'OK', onPress: () => navigation.navigate('MyAppointments') }]
      );
    } catch (error) {
      let errorMessage = 'Ocurrió un error al crear la reserva';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener un objeto con las fechas marcadas para el calendario
  const getMarkedDates = () => {
    const markedDates = {};
    if (selectedDate) {
      markedDates[selectedDate] = { selected: true, selectedColor: colors.primary };
    }
    return markedDates;
  };

  if (loading && !services.length) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva Reserva</Text>
      
      {/* Mostrar el servicio seleccionado si viene preseleccionado */}
      {preSelectedService ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicio seleccionado</Text>
          <View style={styles.selectedServiceContainer}>
            <Text style={styles.selectedServiceName}>{selectedService?.name}</Text>
            <Text style={styles.selectedServiceDetails}>
              {selectedService?.duration} min • {selectedService?.price}€
            </Text>
          </View>
        </View>
      ) : (
        /* Mostrar selector de servicio solo si no hay servicio preseleccionado */
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona un servicio</Text>
          <DropDownPicker
            open={serviceDropdownOpen}
            setOpen={setServiceDropdownOpen}
            value={selectedService?.value}
            setValue={(val) => {
              const service = services.find(s => s.value === val);
              setSelectedService(service);
            }}
            items={services}
            placeholder="Selecciona un servicio"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
      )}
      
      {/* Sección de calendario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            todayTextColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            arrowColor: colors.primary,
          }}
        />
      </View>
      
      {/* Sección de horarios disponibles */}
      {selectedDate && selectedService && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios disponibles</Text>
          
          {availableTimeSlots.length === 0 ? (
            <Text style={styles.noSlots}>No hay horarios disponibles para esta fecha</Text>
          ) : (
            <DropDownPicker
              open={timeDropdownOpen}
              setOpen={setTimeDropdownOpen}
              value={selectedTimeSlot}
              setValue={setSelectedTimeSlot}
              items={availableTimeSlots}
              placeholder="Selecciona un horario"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2000}
              zIndexInverse={2000}
            />
          )}
        </View>
      )}
      
      {/* Resumen de la reserva */}
      {selectedDate && selectedService && selectedTimeSlot && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen de tu reserva:</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Servicio:</Text>
            <Text style={styles.summaryValue}>{selectedService.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Precio:</Text>
            <Text style={styles.summaryValue}>${selectedService.price}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duración:</Text>
            <Text style={styles.summaryValue}>{selectedService.duration} minutos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Fecha:</Text>
            <Text style={styles.summaryValue}>{selectedDate}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Hora:</Text>
            <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
          </View>
        </View>
      )}
      
      {/* Botón para crear la reserva */}
      <Button 
        title="Confirmar Reserva" 
        onPress={handleCreateAppointment}
        disabled={!selectedDate || !selectedService || !selectedTimeSlot || loading}
        loading={loading}
      />
    </ScrollView>
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
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dropdown: {
    borderColor: '#ccc',
    height: 50,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  timeSlot: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.primary,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
  },
  timeSlotText: {
    color: colors.primary,
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  noSlots: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: '500',
    color: '#555',
  },
  summaryValue: {
    color: '#333',
  },
  selectedServiceContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 5,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  selectedServiceDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default NewAppointmentScreen;