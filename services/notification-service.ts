import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType } from '@/types';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // For Android, configure notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('claims', {
        name: 'Claims',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Get push notification token (for production use with a push notification service)
 */
export async function getPushToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // TODO: Replace with actual Expo project ID
    });

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Send a local notification (for testing or immediate notifications)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: { [key: string]: any },
  channelId: string = 'default'
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to send local notification:', error);
    throw error;
  }
}

/**
 * Send a notification for a new message
 */
export async function notifyNewMessage(
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<void> {
  await sendLocalNotification(
    `New message from ${senderName}`,
    messagePreview,
    { type: 'message_received', conversationId },
    'messages'
  );
}

/**
 * Send a notification for claim status change
 */
export async function notifyClaimStatus(
  status: 'submitted' | 'approved' | 'rejected',
  claimId: string
): Promise<void> {
  const titles = {
    submitted: 'Claim Submitted',
    approved: 'Claim Approved!',
    rejected: 'Claim Requires Review',
  };

  const bodies = {
    submitted: 'Your claim has been submitted for review.',
    approved: 'Your claim has been approved and is ready for processing.',
    rejected: 'Your claim requires additional review. Please check the details.',
  };

  await sendLocalNotification(
    titles[status],
    bodies[status],
    { type: `claim_${status}`, claimId },
    'claims'
  );
}

/**
 * Send a notification for estimate ready
 */
export async function notifyEstimateReady(claimId: string, total: number): Promise<void> {
  await sendLocalNotification(
    'Estimate Ready',
    `Your repair estimate is ready: $${total.toFixed(2)}`,
    { type: 'estimate_ready', claimId },
    'claims'
  );
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.dismissNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Get badge count (iOS only)
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Failed to get badge count:', error);
    return 0;
  }
}

/**
 * Set badge count (iOS only)
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Failed to set badge count:', error);
  }
}
