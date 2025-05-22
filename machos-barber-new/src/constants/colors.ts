/**
 * Paleta de colores estandarizada para toda la aplicación
 * Usar estas constantes en lugar de valores hexadecimales directos
 */
export const colors = {
  // Colores principales
  primary: '#000000',        // Negro para elementos principales
  secondary: '#64748B',      // Gris azulado para elementos secundarios
  accent: '#D4AF37',         // Dorado para acentos y destacados
  
  // Fondo y contenedores
  background: '#f8f8f8',     // Fondo principal de la app
  card: '#FFFFFF',           // Fondo de tarjetas y contenedores
  divider: '#E2E8F0',        // Separadores y bordes
  
  // Texto
  text: {                    // Colores de texto
    primary: '#333333',      // Texto principal
    secondary: '#666666',    // Texto secundario
    muted: '#94A3B8',        // Texto atenuado
    inverse: '#FFFFFF',      // Texto sobre fondos oscuros
  },
  
  // Estados
  success: '#10B981',        // Éxito/Confirmado
  warning: '#F59E0B',        // Advertencia/Pendiente
  error: '#DC2626',          // Error/Cancelado
  info: '#3B82F6',           // Información
  
  // Sombras
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Específicos para la barbería
  barber: {
    pole: ['#CC0000', '#FFFFFF', '#0000CC'], // Colores del poste de barbero
    scissors: '#C0C0C0',                      // Color para iconos de tijeras
    chair: '#8B4513',                         // Color para sillones de barbero
  }
};
