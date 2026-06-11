import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@food-delivery/types';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const completed = await SecureStore.getItemAsync('onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
      setIsOnboardingChecked(true);
    }
    void checkOnboarding();
  }, []);

  if (authLoading || !isOnboardingChecked) {
    return (
      <View className="flex-1 justify-center items-center bg-bgApp">
        <ActivityIndicator size="large" color="#ff5722" />
      </View>
    );
  }

  if (showOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) return <Redirect href="/login" />;

  if (user.role === UserRole.CUSTOMER) return <Redirect href={"/(customer)" as any} />;
  if (user.role === UserRole.RESTAURANT_OWNER)
    return <Redirect href={"/(owner)" as any} />;
  if (user.role === UserRole.DRIVER) return <Redirect href={"/(driver)" as any} />;

  return <Redirect href="/login" />;
}
