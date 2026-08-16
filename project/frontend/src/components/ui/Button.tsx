import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const isInteractionDisabled = disabled || isLoading;

  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-brand dark:bg-brand-dark';
      textClass = 'text-white';
      break;
    case 'secondary':
      bgClass = 'bg-surface dark:bg-bg-input';
      textClass = 'text-brand dark:text-brand-light';
      break;
    case 'outline':
      bgClass = 'bg-transparent';
      textClass = 'text-text-main dark:text-text-main';
      borderClass = 'border-2 border-border-input dark:border-border-input';
      break;
    case 'ghost':
      bgClass = 'bg-transparent';
      textClass = 'text-brand dark:text-brand-light';
      break;
  }

  if (isInteractionDisabled) {
    bgClass = variant === 'outline' || variant === 'ghost' ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-800';
    textClass = 'text-gray-500 dark:text-gray-400';
    if (variant === 'outline') {
      borderClass = 'border-2 border-gray-300 dark:border-gray-700';
    }
  }

  return (
    <Pressable
      className={`flex-row items-center justify-center py-4 px-6 rounded-[32px] min-h-[56px] transition-all active:scale-95 ${bgClass} ${borderClass} ${className}`}
      disabled={isInteractionDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#FF6B35'} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`font-rubik font-bold text-base ${textClass}`}>
            {children}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
