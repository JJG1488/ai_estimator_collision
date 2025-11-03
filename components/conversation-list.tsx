import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Conversation } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  onConversationPress: (conversation: Conversation) => void;
  emptyMessage?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  onConversationPress,
  emptyMessage = 'No conversations yet',
}: ConversationListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants
      .filter((p) => p.userId !== currentUserId)
      .map((p) => p.userName)
      .join(', ');
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const unreadCount = item.unreadCount[currentUserId] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff',
            borderBottomColor: colors.icon + '20',
          },
        ]}
        onPress={() => onConversationPress(item)}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {getOtherParticipants(item).charAt(0).toUpperCase()}
            </Text>
          </View>
          {hasUnread && (
            <View style={[styles.unreadDot, { backgroundColor: '#FF3B30' }]} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.name,
                { color: colors.text, fontWeight: hasUnread ? '700' : '600' },
              ]}
              numberOfLines={1}>
              {getOtherParticipants(item)}
            </Text>
            {item.lastMessage && (
              <Text style={[styles.time, { color: colors.icon }]}>
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text
              style={[
                styles.lastMessage,
                { color: hasUnread ? colors.text : colors.icon, fontWeight: hasUnread ? '600' : '400' },
              ]}
              numberOfLines={2}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.unreadCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (conversations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.icon }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
