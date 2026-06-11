import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { UserRole } from '@food-delivery/types';
import { Ionicons } from '@expo/vector-icons';

const ROLES = [
  { label: 'Customer', value: UserRole.CUSTOMER, icon: 'person-outline' },
  { label: 'Merchant', value: UserRole.RESTAURANT_OWNER, icon: 'restaurant-outline' },
  { label: 'Driver', value: UserRole.DRIVER, icon: 'bicycle-outline' },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const theme = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setIsLoading(true);
    try {
      await register({ firstName, lastName, email, password, role });
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message ?? 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView 
      className="bg-bgApp font-rubik"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: 64, paddingBottom: 48 }}
    >
      {/* Brand Header */}
      <View className="items-center mb-8">
        <Image
            source={require('../../assets/logo/logo.png')}
          style={{ width: 64, height: 64, borderRadius: 12 }}
          className="mb-3"
        />
        <Text className="text-headline-md font-bold text-textbrand font-rubik">
         FoddTaste
        </Text>
        <Text className="text-body-sm text-textMuted font-rubik mt-1 text-center">
          Create an account to start your culinary journey
        </Text>
      </View>

      {/* Register Form Card */}
      <View className="bg-white rounded-xl border border-borderInput p-6 shadow-lg mb-6">
        {/* First Name Input */}
        <View className="mb-4">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            FIRST NAME
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              focusedField === 'firstName' ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <TextInput
              className="flex-grow text-base text-textMain font-rubik"
              placeholder="First name"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Last Name Input */}
        <View className="mb-4">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            LAST NAME
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              focusedField === 'lastName' ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <TextInput
              className="flex-grow text-base text-textMain font-rubik"
              placeholder="Last name"
              placeholderTextColor={theme.textSecondary}
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            EMAIL ADDRESS
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              focusedField === 'email' ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <TextInput
              className="flex-grow text-base text-textMain font-rubik"
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            PASSWORD
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              focusedField === 'password' ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <TextInput
              className="flex-grow text-base text-textMain font-rubik"
              placeholder="Password (min 6 characters)"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Role Selector */}
        <View className="mb-8">
          <Text className="text-label-md text-textMuted font-semibold mb-3 font-rubik">
            SIGN UP AS A:
          </Text>
          <View className="flex-row gap-2">
            {ROLES.map((r) => {
              const isActive = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setRole(r.value)}
                  className={`flex-1 flex-col items-center justify-center py-3 rounded-md border ${
                    isActive
                      ? 'bg-brand border-brand shadow-sm'
                      : 'bg-bgInput border-borderInput'
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={r.icon as any}
                    size={20}
                    color={isActive ? '#ffffff' : theme.textSecondary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    className={`text-xs font-semibold font-rubik ${
                      isActive ? 'text-white' : 'text-textMuted'
                    }`}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={{ height: 56 }}
          className={`w-full justify-center items-center rounded-md ${
            isLoading ? 'bg-brandLight' : 'bg-brand active:bg-brandDark'
          }`}
          onPress={() => {
            void handleRegister();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white font-rubik">
              Create Account
            </Text>
          )}
        </Pressable>
      </View>

      {/* Login Footer Link */}
      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-body-sm text-textMuted font-rubik">
          Already have an account?{' '}
          <Text className="font-semibold text-brand font-rubik">Sign In</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
