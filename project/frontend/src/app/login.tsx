import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.replace('/');
    } catch {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <View className="flex-1 bg-bg-app">
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <SafeAreaView className="bg-bg-app border-b border-border-input/30 ">
        <View className="h-14 mb-20 justify-center items-center">
          <Text className="text-xl mb-7 font-bold text-primary font-rubik">
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
            {/* Floating Login Card */}
            <View className="bg-white dark:bg-[#271813] rounded-[32px] p-8 shadow-2xl border border-border-input/40 dark:border-border-input/20 my-8">
              <Text className="text-display-lg text-text-main dark:text-text-main font-bold mb-2 text-center font-rubik">
                Welcome Back!
              </Text>
              <Text className="text-body-sm text-text-muted dark:text-text-muted text-center mb-8 font-rubik">
                Sign in to continue your culinary journey.
              </Text>

              {/* Email Input with Overlapping Label */}
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
                  <Text className="text-xs font-semibold text-primary dark:text-bg-brand font-rubik">
                    Email Address
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    isEmailFocused ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isEmailFocused ? '#b02f00' : '#c24c2fff'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter your email"
                    placeholderTextColor="#a18882"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    style={{ paddingVertical: 0 }}
                  />
                </View>
              </View>

              {/* Password Input with Overlapping Label */}
              <View className="relative mb-2">
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
                  <Text className="text-xs font-semibold text-primary dark:text-bg-brand font-rubik">
                    Password
                  </Text>
                </View>
                <View
                  className={`flex-row items-center rounded-lg border px-4 bg-white dark:bg-[#3e2c27] transition-all ${
                    isPasswordFocused ? 'border-primary' : 'border-border-input'
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isPasswordFocused ? '#b02f00' : '#9f5947ff'}
                  />
                  <TextInput
                    className="ml-3 flex-grow text-base text-text-main dark:text-text-main font-rubik"
                    placeholder="Enter your password"
                    placeholderTextColor="#a18882"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    style={{ paddingVertical: 0 }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#b5472cff"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password Link */}
              <Pressable
                className="self-end mb-8 mt-2"
                onPress={() =>
                  Alert.alert(
                    'Forgot Password',
                    'Password reset flow is not implemented yet.',
                  )
                }
              >
                <Text className="text-sm font-semibold text-primary dark:text-brand-light text-right font-rubik">
                  Forgot Password?
                </Text>
              </Pressable>

              {/* Sign In Button */}
              <Pressable
                style={{ height: 56 }}
                className={`w-full justify-center items-center rounded-xl shadow-lg active:opacity-90 ${
                  isLoading ? 'bg-brand-light' : 'bg-brand active:bg-brand-dark'
                }`}
                onPress={() => void handleLogin()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-bold text-white font-rubik">
                    Sign In
                  </Text>
                )}
              </Pressable>

              {/* Sign Up Footer */}
              <Pressable
                className="mt-8"
                onPress={() => router.push('/register')}
              >
                <Text className="text-center text-body-sm text-text-muted dark:text-text-muted font-rubik">
                  Don't have an account?{' '}
                  <Text className="font-bold text-primary dark:text-brand-light font-rubik">
                    Sign Up
                  </Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </View>
  );
}
