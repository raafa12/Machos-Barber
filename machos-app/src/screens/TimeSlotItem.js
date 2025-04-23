import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimeSlotItem = ({ availability, onEdit, onDelete, isBlocked }) => {
  // Verificar si es un horario bloqueado o disponible
  const isBlockedSlot = availability.isBlocked || isBlocked;
  
  return (
    <View style={[styles.container, isBlockedSlot ? styles.blockedContainer : null]}>
      <View style={styles.timeInfo}>
        <View style={styles.badge}>
          <Ionicons 
            name={isBlockedSlot ? "close-circle" : "checkmark-circle"} 
            size={20} 
            color={isBlockedSlot ? "#F44336" : "#4CAF50"} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.timeText}>
            {availability.startTime} - {availability.endTime}
          </Text>
          {isBlockedSlot ? (
            <Text style={styles.reasonText}>Motivo: {availability.reason || "No especificado"}</Text>
          ) : (
            <Text style={styles.capacityText}>
              Capacidad: {availability.capacity} {availability.capacity > 1 ? 'clientes' : 'cliente'}
            </Text>
          )}
          {availability.repeat && (
            <Text style={styles.repeatText}>
              Repetir semanalmente hasta {new Date(availability.repeatUntil).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={22} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  blockedContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  timeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#F44336',
    fontStyle: 'italic',
    marginTop: 4,
  },
  repeatText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default TimeSlotItem;