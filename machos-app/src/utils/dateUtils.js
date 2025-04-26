import { format } from 'date-fns';

// Función para formatear una fecha
export const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy'); // Puedes cambiar el formato según lo necesites
};
