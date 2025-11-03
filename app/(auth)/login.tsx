import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/buttons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, user } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Login button pressed');
    console.log('Email:', email);

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      console.log('Calling signIn...');
      await signIn(email, password);
      console.log('signIn completed successfully');

      // Navigate based on email
      if (email.includes('adjuster')) {
        console.log('Navigating to adjuster dashboard');
        router.replace('/(adjuster)/(tabs)/pending');
      } else {
        console.log('Navigating to body shop dashboard');
        router.replace('/(body-shop)/(tabs)/dashboard');
      }
    } catch (error) {
      console.error('Login error caught in handleLogin:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Collision Repair AI</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Instant estimates, automated approvals
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <TextInput
            style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            disabled={isLoading}
            loading={isLoading}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: Colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={[styles.linkText, { color: Colors.tint }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.demoHint}>
            <Text style={[styles.hintText, { color: Colors.textSecondary }]}>Demo Hint:</Text>
            <Text style={[styles.hintText, { color: Colors.textSecondary }]}>
              • Use "shop@example.com" for body shop access
            </Text>
            <Text style={[styles.hintText, { color: Colors.textSecondary }]}>
              • Use "adjuster@example.com" for insurance access
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  demoHint: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  hintText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
