import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Message } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onAttachmentPress?: (uri: string) => void;
}

export function MessageBubble({ message, isOwnMessage, onAttachmentPress }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'customer':
        return '#34C759';
      case 'body_shop':
        return '#007AFF';
      case 'insurance_adjuster':
        return '#FF9500';
      default:
        return colors.icon;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Customer';
      case 'body_shop':
        return 'Body Shop';
      case 'insurance_adjuster':
        return 'Adjuster';
      default:
        return role;
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}>
      {!isOwnMessage && (
        <View style={styles.senderInfo}>
          <Text style={[styles.senderName, { color: colors.text }]}>{message.senderName}</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(message.senderRole) + '20' },
            ]}>
            <Text
              style={[styles.roleBadgeText, { color: getRoleBadgeColor(message.senderRole) }]}>
              {getRoleLabel(message.senderRole)}
            </Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage
            ? { backgroundColor: colors.tint }
            : { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
        ]}>
        <Text style={[styles.messageText, { color: isOwnMessage ? '#fff' : colors.text }]}>
          {message.text}
        </Text>

        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment) => (
              <TouchableOpacity
                key={attachment.id}
                style={[
                  styles.attachmentCard,
                  {
                    backgroundColor: isOwnMessage
                      ? 'rgba(255,255,255,0.2)'
                      : colorScheme === 'dark'
                      ? '#2c2c2e'
                      : '#e5e5ea',
                  },
                ]}
                onPress={() => onAttachmentPress?.(attachment.uri)}>
                {attachment.type === 'image' ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                ) : (
                  <>
                    <Text style={[styles.attachmentIcon, { color: isOwnMessage ? '#fff' : colors.text }]}>
                      {attachment.type === 'pdf' ? '📄' : '📎'}
                    </Text>
                    <Text
                      style={[styles.attachmentName, { color: isOwnMessage ? '#fff' : colors.text }]}
                      numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    <Text
                      style={[
                        styles.attachmentSize,
                        { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.icon },
                      ]}>
                      {(attachment.size / 1024).toFixed(1)} KB
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.metadata}>
          <Text
            style={[
              styles.timestamp,
              { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.icon },
            ]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <Text
              style={[
                styles.status,
                { color: message.status === 'read' ? '#34C759' : 'rgba(255,255,255,0.7)' },
              ]}>
              {message.status === 'read' ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  attachmentsContainer: {
    marginTop: 8,
    gap: 8,
  },
  attachmentCard: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  attachmentIcon: {
    fontSize: 24,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
});
