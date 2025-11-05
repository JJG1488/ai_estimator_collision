import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Conversation } from '@/types';
import {
  formatConversationTime,
  getMessagePreview,
  getUnreadCountForUser,
  getOtherParticipants,
  formatParticipantNames,
  getRoleBadgeColor,
} from '@/utils/messaging';
import { Colors } from '@/constants/theme';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}

export default function ConversationListItem({
  conversation,
  currentUserId,
  onPress,
}: ConversationListItemProps) {
  const otherParticipants = getOtherParticipants(conversation, currentUserId);
  const unreadCount = getUnreadCountForUser(conversation, currentUserId);
  const participantName = formatParticipantNames(otherParticipants);
  const lastMessage = conversation.lastMessage;
  const primaryParticipant = otherParticipants[0];
  const roleColor = primaryParticipant ? getRoleBadgeColor(primaryParticipant.userRole) : Colors.icon;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: unreadCount > 0 ? roleColor + '08' : '#fff' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: roleColor + '20' }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>
          {participantName.charAt(0).toUpperCase()}
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: roleColor }]}>
            <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.name,
              { color: Colors.text, fontWeight: unreadCount > 0 ? '700' : '600' },
            ]}
            numberOfLines={1}
          >
            {participantName}
          </Text>
          {lastMessage && (
            <Text style={[styles.time, { color: Colors.icon }]}>
              {formatConversationTime(lastMessage.createdAt)}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          {lastMessage && (
            <>
              <Text
                style={[
                  styles.preview,
                  {
                    color: unreadCount > 0 ? Colors.text : Colors.icon,
                    fontWeight: unreadCount > 0 ? '500' : '400',
                  },
                ]}
                numberOfLines={2}
              >
                {lastMessage.senderId === currentUserId && 'You: '}
                {getMessagePreview(lastMessage)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
});
