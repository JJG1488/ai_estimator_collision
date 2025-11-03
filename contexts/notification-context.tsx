import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '@/types';
import {
  requestNotificationPermissions,
  getPushToken,
  setBadgeCount,
} from '@/services/notification-service';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  pushToken: string | null;
  permissionsGranted: boolean;

  // Actions
  requestPermissions: () => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = '@collision_repair:notifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Load notifications from storage on mount
  useEffect(() => {
    loadNotifications();
    setupNotificationListeners();
    checkPermissions();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Update badge count when unread count changes (iOS)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      setBadgeCount(unreadCount);
    }
  }, [unreadCount]);

  // Save notifications to storage whenever they change
  useEffect(() => {
    saveNotifications();
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          readAt: n.readAt ? new Date(n.readAt) : undefined,
        }));
        setNotifications(notificationsWithDates);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const saveNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionsGranted(status === 'granted');

      if (status === 'granted') {
        const token = await getPushToken();
        setPushToken(token);
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const newNotification: Notification = {
        id: notification.request.identifier,
        userId: '', // Will be set by the sender
        type: (notification.request.content.data?.type as any) || 'message_received',
        title: notification.request.content.title || '',
        message: notification.request.content.body || '',
        claimId: notification.request.content.data?.claimId as string,
        conversationId: notification.request.content.data?.conversationId as string,
        isRead: false,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    });

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      // Handle navigation based on notification type
      if (data?.type === 'message_received' && data?.conversationId) {
        // TODO: Navigate to conversation
        console.log('Navigate to conversation:', data.conversationId);
      } else if (data?.claimId) {
        // TODO: Navigate to claim
        console.log('Navigate to claim:', data.claimId);
      }

      // Mark notification as read
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
    });
  };

  const requestPermissions = async (): Promise<boolean> => {
    const granted = await requestNotificationPermissions();
    setPermissionsGranted(granted);

    if (granted) {
      const token = await getPushToken();
      setPushToken(token);
    }

    return granted;
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date() }
          : n
      )
    );
  };

  const markAllAsRead = async (): Promise<void> => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
    );
  };

  const clearNotification = async (notificationId: string): Promise<void> => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = async (): Promise<void> => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    pushToken,
    permissionsGranted,
    requestPermissions,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
