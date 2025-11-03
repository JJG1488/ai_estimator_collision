import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/buttons';
import { UserRole } from '@/types';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const { signUp, isLoading } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !companyName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await signUp(email, password, companyName, selectedRole);
      // Navigation will be handled by the root layout based on role
    } catch (error) {
      alert('Sign up failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
              Join the future of collision repair
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: Colors.text }]}>Account Type</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'customer' && { backgroundColor: Colors.tint },
                  { borderColor: Colors.border },
                ]}
                onPress={() => setSelectedRole('customer')}
                disabled={isLoading}>
                <Text
                  style={[
                    styles.roleButtonText,
                    { color: selectedRole === 'customer' ? '#fff' : Colors.text },
                  ]}>
                  Customer
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    { color: selectedRole === 'customer' ? '#fff' : Colors.textSecondary },
                  ]}>
                  Free
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'body_shop' && { backgroundColor: Colors.tint },
                  { borderColor: Colors.border },
                ]}
                onPress={() => setSelectedRole('body_shop')}
                disabled={isLoading}>
                <Text
                  style={[
                    styles.roleButtonText,
                    { color: selectedRole === 'body_shop' ? '#fff' : Colors.text },
                  ]}>
                  Body Shop
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    { color: selectedRole === 'body_shop' ? '#fff' : Colors.textSecondary },
                  ]}>
                  $500/month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'insurance_adjuster' && { backgroundColor: Colors.tint },
                  { borderColor: Colors.border },
                ]}
                onPress={() => setSelectedRole('insurance_adjuster')}
                disabled={isLoading}>
                <Text
                  style={[
                    styles.roleButtonText,
                    { color: selectedRole === 'insurance_adjuster' ? '#fff' : Colors.text },
                  ]}>
                  Adjuster
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    { color: selectedRole === 'insurance_adjuster' ? '#fff' : Colors.textSecondary },
                  ]}>
                  $2/claim
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: Colors.text, borderColor: Colors.border }]}
              placeholder={selectedRole === 'customer' ? 'Full Name' : 'Company Name'}
              placeholderTextColor={Colors.textSecondary}
              value={companyName}
              onChangeText={setCompanyName}
              editable={!isLoading}
            />

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
              title="Create Account"
              onPress={handleSignUp}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: Colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={[styles.linkText, { color: Colors.tint }]}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
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
});
