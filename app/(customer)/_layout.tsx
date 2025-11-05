import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerBackTitle: 'Back',
      }}>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="request/insurance-info"
        options={{
          presentation: 'card',
          title: 'Insurance Information',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
