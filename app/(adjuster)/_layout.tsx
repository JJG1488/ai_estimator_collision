import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AdjusterLayout() {
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
        name="claim/[id]/review"
        options={{
          presentation: 'card',
          title: 'Review Claim',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
