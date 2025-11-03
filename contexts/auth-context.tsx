import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, companyName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@collision_repair:user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        // Convert date strings back to Date objects
        parsed.createdAt = new Date(parsed.createdAt);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Mock authentication - in production, this would call an API
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, create a mock user based on email
      let role: UserRole;
      let companyName: string;

      if (email.includes('adjuster')) {
        role = 'insurance_adjuster';
        companyName = 'State Farm Insurance';
      } else if (email.includes('shop') || email.includes('body')) {
        role = 'body_shop';
        companyName = 'Joe\'s Auto Body';
      } else {
        role = 'customer';
        companyName = 'John Doe'; // Default customer name
      }

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        companyName,
        subscriptionTier: role === 'body_shop' ? 'pro' : 'basic',
        createdAt: new Date(),
      };

      console.log('Signing in user:', mockUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      console.log('User signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    companyName: string,
    role: UserRole
  ) => {
    // Mock sign up - in production, this would call an API
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        companyName,
        subscriptionTier: 'basic',
        createdAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
