import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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

  return (
    <SafeAreaView className="flex-1 mt-14 bg-bg-app">
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View className="bg-bg-app border-b border-border-input/30 ">
        <View className="h-14  m-6 mb-20 justify-center items-center">
          <Text className="text-xl mb-7 font-bold text-primary font-rubik">
            FoodTaste
          </Text>
        </View>
      </View>

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
            <Card className="my-8">
              <Text className="text-display-lg text-text-main font-bold mb-2 text-center font-rubik">
                Welcome Back!
              </Text>
              <Text className="text-body-sm text-text-muted text-center mb-8 font-rubik">
                Sign in to continue your culinary journey.
              </Text>

              {/* Email Input */}
              <Input
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Input */}
              <Input
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#b5472c"
                    />
                  </Pressable>
                }
              />

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
              <Button
                onPress={() => void handleLogin()}
                isLoading={isLoading}
              >
                Sign In
              </Button>

              {/* Sign Up Footer */}
              <Pressable
                className="mt-8"
                onPress={() => router.push('/register')}
              >
                <Text className="text-center text-body-sm text-text-muted font-rubik">
                  Don't have an account?{' '}
                  <Text className="font-bold text-primary dark:text-brand-light font-rubik">
                    Sign Up
                  </Text>
                </Text>
              </Pressable>
            </Card>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
