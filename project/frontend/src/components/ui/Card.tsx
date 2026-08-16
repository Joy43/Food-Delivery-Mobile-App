import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`bg-white dark:bg-[#1a110f] rounded-[32px] p-8 shadow-2xl border border-border-input/40 dark:border-white/5 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
