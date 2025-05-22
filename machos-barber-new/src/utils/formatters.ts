/**
 * Utilidades para formatear datos en la aplicación
 */

/**
 * Convierte la primera letra de un string a mayúscula
 * @param string - String a capitalizar
 * @returns String capitalizado
 */
export const capitalize = (string: string): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Formatea un número como moneda (EUR)
 * @param amount - Cantidad a formatear
 * @returns Cantidad formateada como moneda
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === undefined || amount === null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea una fecha en formato ISO a formato legible
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return String(dateString);
  }
};

/**
 * Formatea una hora en formato HH:MM
 * @param timeString - Hora en formato HH:MM
 * @returns Hora formateada
 */
export const formatTime = (timeString: string | Date | null | undefined): string => {
  if (!timeString) return '';
  
  // Si ya está en formato HH:MM, devolverlo tal cual
  if (typeof timeString === 'string' && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
    return timeString;
  }
  
  try {
    // Si es un objeto Date o un timestamp
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return String(timeString);
  }
};

/**
 * Formatea una duración en minutos a formato legible
 * @param minutes - Duración en minutos
 * @returns Duración formateada
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === undefined || minutes === null) return '';
  
  return `${minutes} min`;
};

/**
 * Formatea un nombre para mostrar la primera letra en mayúscula
 * @param name - Nombre a formatear
 * @returns Nombre formateado
 */
export const formatName = (name: string | null | undefined): string => {
  if (!name) return '';
  
  return name.split(' ').map(capitalize).join(' ');
};
