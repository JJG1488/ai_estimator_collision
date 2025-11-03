import { Stack } from 'expo-router';

export default function BodyShopLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="claim/[id]/vehicle-info" options={{ presentation: 'card', title: 'Vehicle Information' }} />
      <Stack.Screen name="claim/[id]/photo-capture" options={{ presentation: 'card', title: 'Capture Photos' }} />
      <Stack.Screen name="claim/[id]/damage-assessment" options={{ presentation: 'card', title: 'Damage Assessment' }} />
      <Stack.Screen name="claim/[id]/estimate" options={{ presentation: 'card', title: 'Estimate' }} />
      <Stack.Screen name="claim/[id]/submit" options={{ presentation: 'modal', title: 'Submit Claim' }} />
    </Stack>
  );
}
