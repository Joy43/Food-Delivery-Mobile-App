import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';

export default function BestProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* ScrollView ensures long content fits on small devices */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View className="bg-white border-b border-gray-100 pb-8 pt-4 items-center px-6">
          <View className="relative">
            {user?.avatarUrl ? (
              <Image
                source={{
                  uri: user.avatarUrl || 'https://via.placeholder.com/150',
                }}
                className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-indigo-600 items-center justify-center border-4 border-white shadow-sm">
                <Text className="text-white text-3xl font-bold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Text>
              </View>
            )}
            {/* ------Edit Indicator Badge------ */}
            <Pressable className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-white shadow-sm active:opacity-80">
              <Text className="text-white text-xs font-bold">Edit</Text>
            </Pressable>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {user?.firstName || 'John'} {user?.lastName || 'Doe'}
          </Text>
          <Text className="text-gray-500 text-sm font-medium mt-1">
            {user?.email || 'user@example.com'}
          </Text>

          <View className="bg-indigo-50 px-3 py-1 rounded-full mt-2">
            <Text className="text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              {user?.role || 'Member'}
            </Text>
          </View>
        </View>

        {/* Stats Row Container */}
        <View className="flex-row justify-around bg-white border-b border-gray-100 py-4 px-6">
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">12</Text>
            <Text className="text-xs text-gray-400 font-medium">Orders</Text>
          </View>
          <View className="items-center border-x border-gray-100 flex-1">
            <Text className="text-lg font-bold text-gray-900">340</Text>
            <Text className="text-xs text-gray-400 font-medium">Points</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">4</Text>
            <Text className="text-xs text-gray-400 font-medium">Reviews</Text>
          </View>
        </View>

        {/* Profile Settings Menu Group */}
        <View className="mt-6 px-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 mb-2">
            Account Settings
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <ProfileMenuItem
              title="Personal Information"
              subtitle="Manage your name and public data"
            />
            <ProfileMenuItem
              title="Security & Password"
              subtitle="Update details and generic settings"
            />
            <ProfileMenuItem
              title="Notifications"
              subtitle="Control push notification triggers"
              isLast
            />
          </View>
        </View>

        {/* Preferences Menu Group */}
        <View className="mt-6 px-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2 mb-2">
            Preferences
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <ProfileMenuItem title="Language" subtitle="English" />
            <ProfileMenuItem
              title="Dark Mode"
              subtitle="System default"
              isLast
            />
          </View>
        </View>

        {/* Destructive Action Section */}
        <View className="mt-8 px-4">
          <Pressable
            className="w-full bg-rose-50 border border-rose-100 active:bg-rose-100 rounded-2xl p-4 items-center justify-center"
            onPress={handleLogout}
          >
            <Text className="text-rose-600 text-base font-semibold">
              Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Reusable Profile Menu Item Component */
interface ProfileMenuItemProps {
  title: string;
  subtitle?: string;
  isLast?: boolean;
}

function ProfileMenuItem({ title, subtitle, isLast }: ProfileMenuItemProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-between p-4 active:bg-gray-50 ${!isLast ? 'border-b border-gray-50' : ''}`}
    >
      <View className="flex-1 pr-4">
        <Text className="text-base font-semibold text-gray-800">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {/* Right chevron indicator icon */}
      <Text className="text-gray-300 text-lg font-light">›</Text>
    </Pressable>
  );
}
