import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '@/types';
import { formatNotificationText } from '@/utils/notifications';
import { Colors } from '@/constants/theme';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onMarkRead?: () => void;
}

export default function NotificationCard({ notification, onPress, onMarkRead }: NotificationCardProps) {
  const { title, body, icon } = formatNotificationText(notification);

  const getTypeColor = () => {
    switch (notification.type) {
      case 'claim_approved':
      case 'estimate_ready':
      case 'payment_received':
        return '#34C759';
      case 'claim_rejected':
        return '#FF3B30';
      case 'supplement_needed':
      case 'payment_due':
        return '#FF9500';
      case 'message_received':
        return Colors.tint;
      default:
        return Colors.icon;
    }
  };

  const typeColor = getTypeColor();
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: notification.isRead ? '#fff' : typeColor + '10',
          borderLeftColor: typeColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: Colors.text,
                fontWeight: notification.isRead ? '600' : '700',
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {!notification.isRead && <View style={[styles.unreadDot, { backgroundColor: typeColor }]} />}
        </View>

        <Text style={[styles.body, { color: Colors.text }]} numberOfLines={3}>
          {body}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.time, { color: Colors.icon }]}>{timeAgo}</Text>

          {onMarkRead && !notification.isRead && (
            <TouchableOpacity
              style={[styles.markReadButton, { backgroundColor: typeColor + '20' }]}
              onPress={(e) => {
                e.stopPropagation();
                onMarkRead();
              }}
            >
              <Text style={[styles.markReadText, { color: typeColor }]}>Mark Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    marginTop: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
  },
  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
