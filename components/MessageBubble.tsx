import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Message } from '@/types';
import { formatMessageTime, getRoleBadgeColor } from '@/utils/messaging';
import { Colors } from '@/constants/theme';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender?: boolean;
  onAttachmentPress?: (attachment: any) => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  showSender = false,
  onAttachmentPress,
}: MessageBubbleProps) {
  const bubbleColor = isOwnMessage ? Colors.tint : '#E5E5EA';
  const textColor = isOwnMessage ? '#fff' : Colors.text;
  const roleColor = getRoleBadgeColor(message.senderRole);

  return (
    <View style={[styles.container, isOwnMessage && styles.ownContainer]}>
      {/* Sender Name (for group chats or non-own messages) */}
      {showSender && !isOwnMessage && (
        <Text style={[styles.senderName, { color: roleColor }]}>{message.senderName}</Text>
      )}

      {/* Message Bubble */}
      <View style={[styles.bubble, { backgroundColor: bubbleColor }, isOwnMessage && styles.ownBubble]}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachments}>
            {message.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachment}
                onPress={() => onAttachmentPress?.(attachment)}
              >
                {attachment.type === 'image' ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                ) : (
                  <View style={[styles.documentAttachment, { borderColor: textColor + '40' }]}>
                    <Text style={[styles.documentIcon, { color: textColor }]}>
                      {getAttachmentIcon(attachment.type)}
                    </Text>
                    <Text style={[styles.documentName, { color: textColor }]} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Message Text */}
        {message.text && (
          <Text style={[styles.text, { color: textColor }]} selectable>
            {message.text}
          </Text>
        )}

        {/* Timestamp & Status */}
        <View style={styles.footer}>
          <Text style={[styles.time, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : Colors.icon }]}>
            {formatMessageTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <Text style={[styles.status, { color: 'rgba(255,255,255,0.7)' }]}>
              {getStatusIcon(message.status)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function getAttachmentIcon(type: string): string {
  switch (type) {
    case 'pdf':
      return '📋';
    case 'document':
      return '📄';
    default:
      return '📎';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'sent':
      return '✓';
    case 'delivered':
      return '✓✓';
    case 'read':
      return '✓✓';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  status: {
    fontSize: 11,
  },
  attachments: {
    marginBottom: 8,
  },
  attachment: {
    marginBottom: 4,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 250,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
