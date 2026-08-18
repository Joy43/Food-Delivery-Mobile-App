import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, className = '', ...props }: CardProps) {
  return (
    <View
      style={[styles.liquidCard, style]}
      className={`bg-white rounded-[32px] p-8 border-[1.5px] border-brand/40 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  liquidCard: {
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
});



