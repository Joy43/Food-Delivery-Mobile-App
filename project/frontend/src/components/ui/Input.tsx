import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onIconPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  onIconPress,
  rightElement,
  className = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!error;
  const borderColor = hasError
    ? 'border-red-500 dark:border-red-500'
    : isFocused
    ? 'border-brand dark:border-brand-light'
    : 'border-border-input dark:border-border-input';

  return (
    <View className={`relative mb-6 ${className}`}>
      {label && (
        <View className="absolute left-4 -top-[10px] bg-bg-app px-2 z-10 transition-colors">
          <Text
            className={`text-xs font-semibold font-rubik ${
              hasError
                ? 'text-red-500'
                : isFocused
                ? 'text-brand dark:text-brand-light'
                : 'text-text-muted dark:text-text-muted'
            }`}
          >
            {label}
          </Text>
        </View>
      )}

      <View
        className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-bg-input transition-all ${borderColor}`}
        style={{ height: 56 }}
      >
        {icon && (
          <Pressable onPress={onIconPress} disabled={!onIconPress}>
            <Ionicons
              name={icon}
              size={20}
              color={
                hasError
                  ? '#ef4444'
                  : isFocused
                  ? '#ff5722'
                  : '#a18882'
              }
            />
          </Pressable>
        )}
        <TextInput
          className={`ml-3 flex-grow text-base font-rubik text-text-main dark:text-text-main`}
          placeholderTextColor="#a18882"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightElement}
      </View>

      {error && (
        <Text className="text-xs text-red-500 mt-1 ml-1 font-rubik">
          {error}
        </Text>
      )}
    </View>
  );
}
