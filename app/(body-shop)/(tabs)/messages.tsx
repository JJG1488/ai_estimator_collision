import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMessage } from '@/contexts/message-context';
import { useAuth } from '@/contexts/auth-context';
import { ConversationList } from '@/components/conversation-list';

export default function BodyShopMessagesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { conversations } = useMessage();
  const { user } = useAuth();

  if (!user) return null;

  // Sort conversations by last message time (most recent first)
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt.getTime() || a.updatedAt.getTime();
    const bTime = b.lastMessage?.createdAt.getTime() || b.updatedAt.getTime();
    return bTime - aTime;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ConversationList
        conversations={sortedConversations}
        currentUserId={user.id}
        onConversationPress={(conversation) => {
          router.push(`/(body-shop)/conversation/${conversation.id}`);
        }}
        emptyMessage="No messages yet. Conversations with customers and adjusters will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
