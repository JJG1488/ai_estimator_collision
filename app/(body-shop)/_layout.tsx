import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function BodyShopLayout() {
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
        name="claim/[id]/vehicle-info"
        options={{
          presentation: 'card',
          title: 'Vehicle Information',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="claim/[id]/photo-capture"
        options={{
          presentation: 'card',
          title: 'Capture Photos',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="claim/[id]/damage-assessment"
        options={{
          presentation: 'card',
          title: 'Damage Assessment',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="claim/[id]/estimate"
        options={{
          presentation: 'card',
          title: 'Generate Estimate',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="claim/[id]/submit"
        options={{
          presentation: 'modal',
          title: 'Submit Claim',
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}
