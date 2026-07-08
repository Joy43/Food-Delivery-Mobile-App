import React from 'react';
import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { UserRole } from '@food-delivery/types';

import '@/global.css';
import { cssInterop } from 'react-native-css-interop';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
      fontSize: 'size',
    },
  },
});

cssInterop(MaterialIcons, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
      fontSize: 'size',
    },
  },
});

import { router, useSegments } from 'expo-router';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  React.useEffect(() => {
    if (isLoading) return;

    // Check if the current segment is one of the public / auth pages
    const currentPath = segments[0];
    const isPublicPage =
      currentPath === 'login' ||
      currentPath === 'register' ||
      currentPath === 'onboarding' ||
      currentPath === 'health';

    if (!user && !isPublicPage) {
      router.replace('/login');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="health" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(driver)" />
    </Stack>
  );
}

export default function TabLayout() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AuthProvider>
    </StripeProvider>
  );
}
