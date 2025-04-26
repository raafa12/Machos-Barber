// src/utils/formatters.js

// Esta versión usa el idioma y moneda del dispositivo
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return amount;
  
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' // Puedes poner USD si prefieres dólares, o cambiarlo dinámicamente
    }).format(amount);
  };
  