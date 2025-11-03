import { Stack } from 'expo-router';

export default function AdjusterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="claim/[id]/review" options={{ presentation: 'card', title: 'Review Claim' }} />
    </Stack>
  );
}
