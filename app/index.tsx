import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    console.log('Index useEffect triggered:', {
      isLoading,
      pathname,
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email
    });

    if (!isLoading) {
      // Only redirect from index page when there's no user
      if (pathname === '/' && !user) {
        console.log('No user on index, navigating to welcome');
        router.replace('/(auth)/welcome');
        return;
      }

      // Navigate authenticated users from anywhere to their dashboard
      if (user) {
        const isOnAuthScreen = pathname.startsWith('/(auth)');
        const isOnIndex = pathname === '/';

        if (isOnAuthScreen || isOnIndex) {
          if (user.role === 'body_shop') {
            console.log('Body shop user logging in, navigating to dashboard');
            router.replace('/(body-shop)/(tabs)/dashboard');
          } else if (user.role === 'insurance_adjuster') {
            console.log('Insurance adjuster user logging in, navigating to pending');
            router.replace('/(adjuster)/(tabs)/pending');
          } else if (user.role === 'customer') {
            console.log('Customer user logging in, navigating to dashboard');
            router.replace('/(customer)/(tabs)/dashboard');
          }
        }
      }
    }
  }, [user, isLoading, pathname]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
