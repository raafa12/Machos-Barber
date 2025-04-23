import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import serviceApi from '../services/serviceApi';
import { Image } from 'react-native-elements';

const ServiceFormScreen = ({ route, navigation }) => {
  // Datos recibidos por parámetro
  const { service, onServiceAdded, onServiceUpdated } = route.params || {};
  const isEditing = !!service;

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos del servicio si estamos editando
  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration.toString(),
        price: service.price.toString(),
        image: service.image || ''
      });
    }
  }, [service]);

  // Actualizar campo del formulario
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'La duración es obligatoria';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'La duración debe ser un número positivo';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'El precio debe ser un número válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // En un escenario real, aquí subirías la imagen a un servidor
      // y obtendrías una URL. Por ahora usaremos la URI local
      handleChange('image', result.assets[0].uri);
    }
  };

  // Guardar servicio
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const serviceData = {
        name: formData.name,
        description: formData.description,
        duration: Number(formData.duration),
        price: Number(formData.price),
        image: formData.image
      };
      
      if (isEditing) {
        await serviceApi.updateService(service._id, serviceData);
        if (onServiceUpdated) onServiceUpdated();
        Alert.alert('Éxito', 'Servicio actualizado correctamente');
      } else {
        await serviceApi.createService(serviceData);
        if (onServiceAdded) onServiceAdded();
        Alert.alert('Éxito', 'Servicio creado correctamente');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error', 
        isEditing 
          ? 'No se pudo actualizar el servicio' 
          : 'No se pudo crear el servicio'
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Nombre del servicio"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Descripción del servicio"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Duración (min)</Text>
            <TextInput
              style={[styles.input, errors.duration && styles.inputError]}
              value={formData.duration}
              onChangeText={(value) => handleChange('duration', value)}
              placeholder="Duración en minutos"
              keyboardType="numeric"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              value={formData.price}
              onChangeText={(value) => handleChange('price', value)}
              placeholder="Precio del servicio"
              keyboardType="numeric"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Imagen</Text>
          <TouchableOpacity 
            style={styles.imagePickerButton} 
            onPress={pickImage}
          >
            <Ionicons name="camera" size={24} color="#007bff" />
            <Text style={styles.imagePickerText}>
              {formData.image ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </TouchableOpacity>
          
          {formData.image ? (
            <Image
              source={{ uri: formData.image }}
              style={styles.previewImage}
              PlaceholderContent={<ActivityIndicator />}
            />
          ) : null}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Actualizar' : 'Crear'} Servicio
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#212529',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    height: 100,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 12,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#007bff',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ServiceFormScreen;