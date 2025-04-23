import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

const BlockTimeModal = ({ visible, onClose, onSave }) => {
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  
  // Reiniciar el formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      // Establecer valores predeterminados
      setStartTime('12:00');
      setEndTime('13:00');
      setReason('Descanso');
    }
  }, [visible]);
  
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
  
  // Validar el formulario antes de guardar
  const validateForm = () => {
    // Validar que la hora de inicio sea anterior a la hora de fin
    const start = timeStringToDate(startTime);
    const end = timeStringToDate(endTime);
    
    if (start >= end) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de fin');
      return false;
    }
    
    // Validar que haya una razón
    if (!reason.trim()) {
      Alert.alert('Error', 'Debes especificar una razón para bloquear el horario');
      return false;
    }
    
    return true;
  };
  
  // Guardar el bloqueo de horario
  const handleSave = () => {
    if (!validateForm()) return;
    
    const blockData = {
      startTime,
      endTime,
      reason,
      isBlocked: true
    };
    
    onSave(blockData);
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
            <Text style={styles.modalTitle}>Bloquear Horario</Text>
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
            
            {/* Razón del bloqueo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Motivo del bloqueo:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Ej: Descanso, formación, asuntos personales..."
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.blockButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Bloquear</Text>
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
    maxHeight: '60%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  blockButton: {
    backgroundColor: '#FF9800',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BlockTimeModal;