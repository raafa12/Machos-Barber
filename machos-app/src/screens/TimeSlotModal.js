import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ScrollView
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

const TimeSlotModal = ({ visible, onClose, onSave, availability }) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [capacity, setCapacity] = useState('1');
  const [repeat, setRepeat] = useState(false);
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatUntil, setRepeatUntil] = useState(new Date());
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isRepeatUntilPickerVisible, setRepeatUntilPickerVisible] = useState(false);
  
  // Días de la semana para repetición
  const weekDays = [
    { id: 0, name: 'Dom' },
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' }
  ];
  
  // Reiniciar el formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      if (availability) {
        // Si estamos editando, cargar datos existentes
        setStartTime(availability.startTime);
        setEndTime(availability.endTime);
        setCapacity(availability.capacity.toString());
        // Si hay datos de repetición, establecerlos también
        if (availability.repeat) {
          setRepeat(true);
          setRepeatDays(availability.repeatDays || []);
          setRepeatUntil(new Date(availability.repeatUntil) || new Date());
        } else {
          setRepeat(false);
          setRepeatDays([]);
          
          // Establecer repeatUntil a 2 semanas en el futuro por defecto
          const twoWeeksLater = new Date();
          twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
          setRepeatUntil(twoWeeksLater);
        }
      } else {
        // Si es nuevo, establecer valores predeterminados
        setStartTime('09:00');
        setEndTime('10:00');
        setCapacity('1');
        setRepeat(false);
        setRepeatDays([]);
        
        // Establecer repeatUntil a 2 semanas en el futuro por defecto
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
        setRepeatUntil(twoWeeksLater);
      }
    }
  }, [visible, availability]);
  
  // Convertir string de hora a objeto Date para el picker
  const timeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  // Formatear Date a string de hora (HH:MM)
  const formatTimeToString = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Manejar la selección del tiempo de inicio
  const handleStartTimeConfirm = (date) => {
    setStartTime(formatTimeToString(date));
    setStartTimePickerVisible(false);
  };
  
  // Manejar la selección del tiempo de fin
  const handleEndTimeConfirm = (date) => {
    setEndTime(formatTimeToString(date));
    setEndTimePickerVisible(false);
  };
  
  // Manejar la selección de la fecha hasta la que se repite
  const handleRepeatUntilConfirm = (date) => {
    setRepeatUntil(date);
    setRepeatUntilPickerVisible(false);
  };
  
  // Alternar un día en la selección de repetición
  const toggleDay = (dayId) => {
    if (repeatDays.includes(dayId)) {
      setRepeatDays(repeatDays.filter(id => id !== dayId));
    } else {
      setRepeatDays([...repeatDays, dayId]);
    }
  };
  
  // Validar el formulario antes de guardar
  const validateForm = () => {
    // Validar que la hora de inicio sea anterior a la hora de fin
    const start = timeStringToDate(startTime);
    const end = timeStringToDate(endTime);
    
    if (start >= end) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de fin');
      return false;
    }
    
    // Validar que la capacidad sea un número entero positivo
    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert('Error', 'La capacidad debe ser un número entero positivo');
      return false;
    }
    
    // Si se seleccionó repetición, validar que haya al menos un día seleccionado
    if (repeat && repeatDays.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un día para la repetición');
      return false;
    }
    
    return true;
  };
  
  // Guardar la disponibilidad
  const handleSave = () => {
    if (!validateForm()) return;
    
    const availabilityData = {
      startTime,
      endTime,
      capacity: parseInt(capacity, 10),
      isBlocked: false
    };
    
    // Si se seleccionó repetición, añadir datos de repetición
    if (repeat) {
      availabilityData.repeat = true;
      availabilityData.repeatDays = repeatDays;
      availabilityData.repeatUntil = repeatUntil.toISOString();
    }
    
    onSave(availabilityData);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {availability ? 'Editar Disponibilidad' : 'Añadir Disponibilidad'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Selección de hora de inicio */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora de inicio:</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setStartTimePickerVisible(true)}
              >
                <Text style={styles.timeText}>{startTime}</Text>
                <Ionicons name="time-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Selección de hora de fin */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora de fin:</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setEndTimePickerVisible(true)}
              >
                <Text style={styles.timeText}>{endTime}</Text>
                <Ionicons name="time-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Capacidad */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacidad (clientes simultáneos):</Text>
              <TextInput
                style={styles.input}
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>
            
            {/* Opción de repetición */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Repetir cada semana</Text>
                <Switch value={repeat} onValueChange={setRepeat} />
              </View>
            </View>
            
            {/* Opciones de repetición (visibles solo si repeat es true) */}
            {repeat && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Repetir en estos días:</Text>
                  <View style={styles.daysContainer}>
                    {weekDays.map(day => (
                      <TouchableOpacity
                        key={day.id}
                        style={[
                          styles.dayButton,
                          repeatDays.includes(day.id) && styles.dayButtonSelected
                        ]}
                        onPress={() => toggleDay(day.id)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            repeatDays.includes(day.id) && styles.dayTextSelected
                          ]}
                        >
                          {day.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Repetir hasta:</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setRepeatUntilPickerVisible(true)}
                  >
                    <Text style={styles.dateText}>
                      {repeatUntil.toLocaleDateString('es-ES')}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          {/* Pickers para selección de tiempo */}
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartTimePickerVisible(false)}
            date={timeStringToDate(startTime)}
            is24Hour={true}
          />
          
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndTimePickerVisible(false)}
            date={timeStringToDate(endTime)}
            is24Hour={true}
          />
          
          <DateTimePickerModal
            isVisible={isRepeatUntilPickerVisible}
            mode="date"
            onConfirm={handleRepeatUntilConfirm}
            onCancel={() => setRepeatUntilPickerVisible(false)}
            date={repeatUntil}
            minimumDate={new Date()}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    maxHeight: '80%',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  timeText: {
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  dayButtonSelected: {
    backgroundColor: '#2196F3',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TimeSlotModal;