import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();

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
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <View className="flex-1 justify-center bg-bgApp px-margin-mobile font-rubik">
      {/* App Logo & Brand Name */}
      <View className="items-center mb-8">
        <Image
          source={require('../../assets/logo/logo.png')}
          style={{ width: 80, height: 80, borderRadius: 16 }}
          className="mb-4"
        />
        <Text className="text-headline-md font-bold text-textMain font-rubik">
          FoodTaste
        </Text>
        <Text className="text-body-sm text-textMuted font-rubik mt-1">
          Culinary excellence delivered to your door
        </Text>
      </View>

      {/* Floating Login Card */}
      <View className="bg-white rounded-xl border border-borderInput p-6 shadow-lg">
        <Text className="text-headline-sm font-bold text-brand font-rubik mb-2 text-center">
          Welcome Back!
        </Text>
        <Text className="text-body-sm text-brand font-rubik mb-6 text-center">
          Sign in to continue your culinary journey.
        </Text>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            EMAIL ADDRESS
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              isEmailFocused ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textSecondary}
            />
            <TextInput
              className="ml-3 flex-grow text-base text-textMain font-rubik"
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-label-md text-brand font-semibold mb-2 font-rubik">
            PASSWORD
          </Text>
          <View
            className={`flex-row items-center rounded-md border px-4 bg-bgInput transition-all ${
              isPasswordFocused ? 'border-brand' : 'border-borderInput'
            }`}
            style={{ height: 56 }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecondary}
            />
            <TextInput
              className="ml-3 flex-grow text-base text-textMain font-rubik"
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Forgot Password Link */}
        <Pressable className="align-self-end mb-6">
          <Text className="text-sm font-semibold text-brand text-right font-rubik">
            Forgot Password?
          </Text>
        </Pressable>

        {/* Sign In Button */}
        <Pressable
          style={{ height: 56 }}
          className={`w-full justify-center items-center rounded-md ${
            isLoading ? 'bg-brandLight' : 'bg-brand active:bg-brandDark'
          }`}
          onPress={() => void handleLogin()}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white font-rubik">
              Sign In
            </Text>
          )}
        </Pressable>
      </View>

      {/* Sign Up Footer */}
      <Pressable className="mt-6" onPress={() => router.push('/register')}>
        <Text className="text-center text-body-sm text-textMuted font-rubik">
          Don't have an account?{' '}
          <Text className="font-semibold text-brand font-rubik">Sign Up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
