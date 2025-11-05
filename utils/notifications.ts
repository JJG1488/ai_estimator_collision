import { NotificationType, Notification } from '@/types';
import { ClaimStatus } from '@/types';

/**
 * Push Notifications System
 * Manages notification triggers, templates, and delivery
 */

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  priority: 'high' | 'normal' | 'low';
  sound?: string;
  vibrate?: boolean;
  badge?: number;
}

export interface NotificationTrigger {
  event: string;
  condition?: (data: any) => boolean;
  template: (data: any) => NotificationTemplate;
}

/**
 * Notification templates for different events
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, (data: any) => NotificationTemplate> = {
  claim_submitted: (data) => ({
    type: 'claim_submitted',
    title: 'Claim Submitted Successfully',
    body: `Your ${data.vehicleName} claim has been submitted and is being analyzed by our AI.`,
    priority: 'normal',
    sound: 'default',
    vibrate: true,
  }),

  claim_approved: (data) => ({
    type: 'claim_approved',
    title: '✅ Estimate Ready!',
    body: `Your ${data.vehicleName} repair estimate is complete. Total: ${data.estimateAmount}`,
    priority: 'high',
    sound: 'success',
    vibrate: true,
    badge: 1,
  }),

  claim_rejected: (data) => ({
    type: 'claim_rejected',
    title: 'Claim Update',
    body: `We're unable to provide an estimate for your ${data.vehicleName} at this time. ${data.reason || ''}`,
    priority: 'high',
    sound: 'default',
    vibrate: true,
  }),

  message_received: (data) => ({
    type: 'message_received',
    title: `New message from ${data.senderName}`,
    body: data.messagePreview,
    priority: 'high',
    sound: 'message',
    vibrate: true,
    badge: 1,
  }),

  estimate_ready: (data) => ({
    type: 'estimate_ready',
    title: 'Your Estimate is Ready!',
    body: `${data.bodyShopName} has completed your ${data.vehicleName} estimate. Tap to view details.`,
    priority: 'high',
    sound: 'success',
    vibrate: true,
    badge: 1,
  }),

  supplement_needed: (data) => ({
    type: 'supplement_needed',
    title: 'Additional Information Needed',
    body: `${data.bodyShopName} needs more information about your ${data.vehicleName}. ${data.requestDetails}`,
    priority: 'high',
    sound: 'default',
    vibrate: true,
    badge: 1,
  }),

  payment_due: (data) => ({
    type: 'payment_due',
    title: 'Payment Due',
    body: `Your payment of ${data.amount} for ${data.vehicleName} is due on ${data.dueDate}.`,
    priority: 'normal',
    sound: 'default',
    vibrate: false,
  }),

  payment_received: (data) => ({
    type: 'payment_received',
    title: 'Payment Received',
    body: `Thank you! Your payment of ${data.amount} has been received.`,
    priority: 'normal',
    sound: 'success',
    vibrate: false,
  }),
};

/**
 * Notification triggers based on claim status changes
 */
export const STATUS_CHANGE_TRIGGERS: Record<ClaimStatus, NotificationTrigger | null> = {
  draft: null, // No notification for drafts

  analyzing: {
    event: 'claim:submitted',
    template: (claim) => NOTIFICATION_TEMPLATES.claim_submitted({
      vehicleName: `${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`,
    }),
  },

  pending_review: {
    event: 'claim:ai_complete',
    template: (claim) => ({
      type: 'estimate_ready',
      title: 'AI Analysis Complete',
      body: `Preliminary estimate ready for your ${claim.vehicle.year} ${claim.vehicle.make}. Body shop review in progress.`,
      priority: 'normal',
      sound: 'default',
      vibrate: true,
    }),
  },

  supplement_needed: {
    event: 'claim:supplement_requested',
    template: (claim) => NOTIFICATION_TEMPLATES.supplement_needed({
      bodyShopName: claim.bodyShopName,
      vehicleName: `${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`,
      requestDetails: 'Please provide additional photos.',
    }),
  },

  approved: {
    event: 'claim:approved',
    template: (claim) => NOTIFICATION_TEMPLATES.claim_approved({
      vehicleName: `${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`,
      estimateAmount: claim.estimate
        ? `$${claim.estimate.total.toLocaleString()}`
        : 'Ready to view',
    }),
  },

  rejected: {
    event: 'claim:rejected',
    template: (claim) => NOTIFICATION_TEMPLATES.claim_rejected({
      vehicleName: `${claim.vehicle.year} ${claim.vehicle.make} ${claim.vehicle.model}`,
      reason: claim.rejectionReason,
    }),
  },
};

/**
 * Notification scheduling
 */
export interface ScheduledNotification {
  id: string;
  scheduledFor: Date;
  template: NotificationTemplate;
  data: any;
  sent: boolean;
}

/**
 * Create scheduled notification for reminders
 */
export function scheduleNotification(
  template: NotificationTemplate,
  scheduledFor: Date,
  data: any
): ScheduledNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scheduledFor,
    template,
    data,
    sent: false,
  };
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: number; // Hour (0-23)
    end: number; // Hour (0-23)
  };
  sound: boolean;
  vibrate: boolean;
  badge: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  types: {
    claim_submitted: true,
    claim_approved: true,
    claim_rejected: true,
    message_received: true,
    estimate_ready: true,
    supplement_needed: true,
    payment_due: true,
    payment_received: true,
  },
  quietHours: {
    enabled: false,
    start: 22, // 10 PM
    end: 8, // 8 AM
  },
  sound: true,
  vibrate: true,
  badge: true,
};

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  type: NotificationType,
  preferences: NotificationPreferences
): boolean {
  // Check if notifications are enabled
  if (!preferences.enabled) return false;

  // Check if this type is enabled
  if (!preferences.types[type]) return false;

  // Check quiet hours
  if (preferences.quietHours?.enabled) {
    const now = new Date();
    const hour = now.getHours();
    const { start, end } = preferences.quietHours;

    // Handle overnight quiet hours (e.g., 22-8)
    if (start > end) {
      if (hour >= start || hour < end) {
        // During quiet hours - only send high priority
        return type === 'claim_approved' || type === 'message_received';
      }
    } else {
      // Normal quiet hours (e.g., 13-15)
      if (hour >= start && hour < end) {
        return type === 'claim_approved' || type === 'message_received';
      }
    }
  }

  return true;
}

/**
 * Format notification for display
 */
export function formatNotificationText(notification: Notification): {
  title: string;
  body: string;
  icon: string;
} {
  const icons: Record<NotificationType, string> = {
    claim_submitted: '📤',
    claim_approved: '✅',
    claim_rejected: '❌',
    message_received: '💬',
    estimate_ready: '📋',
    supplement_needed: '📸',
    payment_due: '💳',
    payment_received: '✅',
  };

  return {
    title: notification.title,
    body: notification.message,
    icon: icons[notification.type] || '🔔',
  };
}

/**
 * Group notifications by type
 */
export function groupNotifications(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce((groups, notification) => {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.isRead).length;
}

/**
 * Get notifications by claim
 */
export function getClaimNotifications(
  notifications: Notification[],
  claimId: string
): Notification[] {
  return notifications.filter(n => n.claimId === claimId);
}

/**
 * Notification action handlers
 */
export interface NotificationAction {
  type: NotificationType;
  handler: (notification: Notification) => void;
}

export function getNotificationActions(
  onViewClaim: (claimId: string) => void,
  onViewEstimate: (claimId: string) => void,
  onViewMessages: (conversationId: string) => void,
  onViewPayment: (claimId: string) => void
): NotificationAction[] {
  return [
    {
      type: 'claim_submitted',
      handler: (n) => n.claimId && onViewClaim(n.claimId),
    },
    {
      type: 'claim_approved',
      handler: (n) => n.claimId && onViewEstimate(n.claimId),
    },
    {
      type: 'claim_rejected',
      handler: (n) => n.claimId && onViewClaim(n.claimId),
    },
    {
      type: 'message_received',
      handler: (n) => n.conversationId && onViewMessages(n.conversationId),
    },
    {
      type: 'estimate_ready',
      handler: (n) => n.claimId && onViewEstimate(n.claimId),
    },
    {
      type: 'supplement_needed',
      handler: (n) => n.claimId && onViewClaim(n.claimId),
    },
    {
      type: 'payment_due',
      handler: (n) => n.claimId && onViewPayment(n.claimId),
    },
    {
      type: 'payment_received',
      handler: (n) => n.claimId && onViewClaim(n.claimId),
    },
  ];
}
