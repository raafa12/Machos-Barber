import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

/**
 * Componente Button reutilizable con diferentes variantes
 */
const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  style, 
  textStyle, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon = null
}) => {
  // Determinar los estilos según la variante
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      default: // 'primary'
        return styles.buttonPrimary;
    }
  };
  
  // Determinar los estilos de texto según la variante
  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default: // 'primary', 'secondary', 'danger'
        return styles.textPrimary;
    }
  };
  
  // Determinar los estilos según el tamaño
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default: // 'medium'
        return {};
    }
  };
  
  // Determinar los estilos de texto según el tamaño
  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default: // 'medium'
        return {};
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.button, 
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.buttonDisabled,
        style
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.primary : colors.text.inverse} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text, 
            getTextStyle(),
            getTextSizeStyle(),
            disabled && styles.textDisabled,
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.divider,
    borderColor: colors.divider,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textPrimary: {
    color: colors.text.inverse,
  },
  textOutline: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.text.muted,
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;
