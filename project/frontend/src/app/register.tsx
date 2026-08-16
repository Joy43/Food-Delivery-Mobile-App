import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <View className="flex-1 bg-bg-app">
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <SafeAreaView className="bg-bg-app border-b border-border-input/30 z-10">
        <View className="h-14 justify-center items-center">
          <Text className="text-xl font-bold text-primary font-rubik">
            FoodTaste
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Food Background Image */}
        <ImageBackground
          /* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
          source={require('../../assets/images/login_background.png')}
          className="flex-1 justify-center"
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* Floating Register Card */}
            <View className="bg-white dark:bg-[#271813] rounded-[32px] p-8 shadow-2xl border border-border-input/40 dark:border-border-input/20 my-8">
              <Text className="text-display-lg text-text-main dark:text-text-main font-bold mb-2 text-center font-rubik">
                Create Account
              </Text>
              <Text className="text-body-sm text-text-muted dark:text-text-muted text-center mb-8 font-rubik">
                Create an account to start your culinary journey
              </Text>

              {/* First Name Input */}
              <View className="relative mb-6">
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: -10,
                    backgroundColor: 'white',
                    paddingHorizontal: 8,
                    zIndex: 10,
                  }}
                  className="dark:bg-[#271813]"
                >
                  <Text className="text-xs font-semibold text-primary dark:text-brand-light font-rubik">
                    First Name
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    focusedField === 'firstName' ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedField === 'firstName' ? '#b02f00' : '#5b4039'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter first name"
                    placeholderTextColor="#a18882"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingVertical: 0 }}
                  />
                </View>
              </View>

              {/* Last Name Input */}
              <View className="relative mb-6">
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: -10,
                    backgroundColor: 'white',
                    paddingHorizontal: 8,
                    zIndex: 10,
                  }}
                  className="dark:bg-[#271813]"
                >
                  <Text className="text-xs font-semibold text-primary dark:text-brand-light font-rubik">
                    Last Name
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    focusedField === 'lastName' ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedField === 'lastName' ? '#b02f00' : '#5b4039'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter last name"
                    placeholderTextColor="#a18882"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingVertical: 0 }}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="relative mb-6">
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: -10,
                    backgroundColor: 'white',
                    paddingHorizontal: 8,
                    zIndex: 10,
                  }}
                  className="dark:bg-[#271813]"
                >
                  <Text className="text-xs font-semibold text-primary dark:text-brand-light font-rubik">
                    Email Address
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    focusedField === 'email' ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedField === 'email' ? '#b02f00' : '#5b4039'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter email address"
                    placeholderTextColor="#a18882"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingVertical: 0 }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="relative mb-6">
                <View
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: -10,
                    backgroundColor: 'white',
                    paddingHorizontal: 8,
                    zIndex: 10,
                  }}
                  className="dark:bg-[#271813]"
                >
                  <Text className="text-xs font-semibold text-primary dark:text-brand-light font-rubik">
                    Password
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    focusedField === 'password' ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedField === 'password' ? '#b02f00' : '#5b4039'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter password"
                    placeholderTextColor="#a18882"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={{ paddingVertical: 0 }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#5b4039"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Role Selector */}
              <View className="mb-8">
                <Text className="text-xs font-bold text-text-muted dark:text-text-muted mb-3 font-rubik tracking-wider uppercase">
                  Sign Up As A:
                </Text>
                <View className="flex-row gap-2">
                  {ROLES.map((r) => {
                    const isActive = role === r.value;
                    return (
                      <Pressable
                        key={r.value}
                        onPress={() => setRole(r.value)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            backgroundColor: isActive ? '#FF6B35' : '#ffffff',
                            borderColor: isActive ? '#FF6B35' : '#e4beb4',
                            shadowColor: isActive ? '#000' : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isActive ? 0.1 : 0,
                            shadowRadius: 4,
                            elevation: isActive ? 3 : 0,
                          },
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <Ionicons
                          name={r.icon as any}
                          size={20}
                          color={isActive ? '#ffffff' : '#5b4039'}
                          style={{ marginBottom: 4 }}
                        />
                        <Text
                          className={`text-xs font-bold font-rubik ${
                            isActive ? 'text-white' : 'text-text-muted dark:text-text-muted'
                          }`}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Create Account Button */}
              <Pressable
                style={({ pressed }) => [
                  {
                    height: 56,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                    backgroundColor: isLoading ? '#FF8E60' : '#E5531B',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 5,
                  },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={() => {
                  void handleRegister();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-bold text-white font-rubik">
                    Create Account
                  </Text>
                )}
              </Pressable>

              {/* Login Footer Link */}
              <Pressable style={{ marginTop: 32 }} onPress={() => router.back()}>
                <Text className="text-center text-body-sm text-text-muted dark:text-text-muted font-rubik">
                  Already have an account?{' '}
                  <Text className="font-bold text-primary dark:text-brand-light font-rubik">Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </View>
  );
}
