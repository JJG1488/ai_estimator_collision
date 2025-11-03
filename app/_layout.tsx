import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/auth-context';
import { ClaimProvider } from '@/contexts/claim-context';
import { MessageProvider } from '@/contexts/message-context';
import { NotificationProvider } from '@/contexts/notification-context';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(body-shop)" options={{ headerShown: false }} />
        <Stack.Screen name="(adjuster)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ClaimProvider>
        <MessageProvider>
          <NotificationProvider>
            <RootLayoutNav />
          </NotificationProvider>
        </MessageProvider>
      </ClaimProvider>
    </AuthProvider>
  );
}
