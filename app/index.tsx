import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index useEffect triggered:', {
      isLoading,
      pathname,
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email
    });

    if (!isLoading) {
      // Redirect to welcome screen if no user (including after sign out)
      if (!user) {
        console.log('No user detected, navigating to welcome');
        router.replace('/(auth)/welcome');
        return;
      }

      // Navigate authenticated users to their appropriate dashboard
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
  }, [user, isLoading, pathname, router]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ActivityIndicator size="large" color={Colors.tint} />
      <Text style={[styles.loadingText, { color: Colors.text }]}>Loading...</Text>
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
