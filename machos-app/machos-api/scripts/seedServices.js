const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../src/models/Service');

// Datos de los servicios de ejemplo
const sampleServices = [
  {
    name: 'Corte de Pelo',
    description: 'Corte de cabello clásico con tijera y máquina',
    price: 15,
    duration: 30, // en minutos
    category: 'haircut',
    image: 'https://example.com/corte.jpg',
    isActive: true
  },
  {
    name: 'Corte y Barba',
    description: 'Corte de cabello más arreglo de barba',
    price: 22,
    duration: 45,
    category: 'treatment',
    image: 'https://example.com/corte-barba.jpg',
    isActive: true
  },
  {
    name: 'Arreglo de Barba',
    description: 'Perfilado y arreglo de barba con toalla caliente',
    price: 13,
    duration: 20,
    category: 'treatment',
    image: 'https://example.com/barba.jpg',
    isActive: true
  }
];

// Conexión a la base de datos
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/machos';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Función para insertar los servicios
const seedServices = async () => {
  try {
    // Eliminar servicios existentes
    await Service.deleteMany({});
    console.log('Servicios existentes eliminados');
    
    // Insertar nuevos servicios
    const createdServices = await Service.insertMany(sampleServices);
    console.log(`${createdServices.length} servicios insertados correctamente`);
    
    // Mostrar los servicios insertados
    console.log('Servicios insertados:');
    console.log(createdServices);
    
    process.exit(0);
  } catch (error) {
    console.error('Error insertando servicios:', error);
    process.exit(1);
  }
};

// Ejecutar la función de inserción
seedServices();
