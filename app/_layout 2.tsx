import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ClaimProvider } from '@/contexts/claim-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inBodyShopGroup = segments[0] === '(body-shop)';
    const inAdjusterGroup = segments[0] === '(adjuster)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'body_shop' && !inBodyShopGroup) {
        router.replace('/(body-shop)/(tabs)/dashboard');
      } else if (user.role === 'insurance_adjuster' && !inAdjusterGroup) {
        router.replace('/(adjuster)/(tabs)/pending');
      }
    }
  }, [user, segments, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(body-shop)" options={{ headerShown: false }} />
        <Stack.Screen name="(adjuster)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ClaimProvider>
        <RootLayoutNav />
      </ClaimProvider>
    </AuthProvider>
  );
}
