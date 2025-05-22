/**
 * Utilidades para manejo de fechas en la aplicación
 */

/**
 * Formatea una fecha en formato ISO a formato legible
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return String(dateString);
  }
};

/**
 * Formatea una fecha en formato largo con día de la semana
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada con día de la semana
 */
export const formatDateLong = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error al formatear fecha larga:', error);
    return String(dateString);
  }
};

/**
 * Verifica si una fecha es hoy
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns true si la fecha es hoy, false en caso contrario
 */
export const isToday = (dateString: string | Date | null | undefined): boolean => {
  if (!dateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date.getTime() === today.getTime();
};

/**
 * Verifica si una fecha es en el futuro
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns true si la fecha es en el futuro, false en caso contrario
 */
export const isFutureDate = (dateString: string | Date | null | undefined): boolean => {
  if (!dateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date.getTime() > today.getTime();
};

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 * @returns Fecha actual en formato ISO
 */
export const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Suma días a una fecha
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @param days - Número de días a sumar
 * @returns Nueva fecha en formato ISO
 */
export const addDays = (dateString: string | Date | null | undefined, days: number): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
