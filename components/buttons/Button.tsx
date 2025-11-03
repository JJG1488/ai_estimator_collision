import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'success';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    if (disabled) {
      return styles.buttonDisabled;
    }

    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'secondary':
        return styles.buttonSecondary;
      case 'destructive':
        return styles.buttonDestructive;
      case 'success':
        return styles.buttonSuccess;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled) {
      return styles.textDisabled;
    }

    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'secondary':
        return styles.textSecondary;
      case 'destructive':
        return styles.textDestructive;
      case 'success':
        return styles.textSuccess;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? Colors.buttonSecondaryText : '#fff'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: Colors.buttonPrimary,
  },
  buttonSecondary: {
    backgroundColor: Colors.buttonSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDestructive: {
    backgroundColor: Colors.buttonDestructive,
  },
  buttonSuccess: {
    backgroundColor: Colors.buttonSuccess,
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
  },
  textPrimary: {
    color: Colors.buttonPrimaryText,
  },
  textSecondary: {
    color: Colors.buttonSecondaryText,
  },
  textDestructive: {
    color: Colors.buttonDestructiveText,
  },
  textSuccess: {
    color: Colors.buttonSuccessText,
  },
  textDisabled: {
    color: Colors.buttonDisabledText,
  },
});
