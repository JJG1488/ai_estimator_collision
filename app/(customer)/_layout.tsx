import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="request/insurance-info" options={{ presentation: 'card', title: 'Insurance Information' }} />
    </Stack>
  );
}
