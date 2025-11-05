import { Message, Conversation, UserRole, MessageAttachment } from '@/types';

/**
 * In-App Messaging Utilities
 * Handles message formatting, filtering, and conversation management
 */

export interface ConversationParticipant {
  userId: string;
  userName: string;
  userRole: UserRole;
  lastSeen?: Date;
  isTyping?: boolean;
}

export interface MessageGroup {
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  messages: Message[];
  timestamp: Date;
}

/**
 * Group messages by sender for chat bubble grouping
 */
export function groupMessagesBySender(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  messages.forEach((message) => {
    if (!currentGroup || currentGroup.senderId !== message.senderId) {
      // Start new group
      currentGroup = {
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        messages: [message],
        timestamp: message.createdAt,
      };
      groups.push(currentGroup);
    } else {
      // Add to existing group if within 5 minutes
      const timeDiff = message.createdAt.getTime() - currentGroup.timestamp.getTime();
      if (timeDiff < 5 * 60 * 1000) {
        currentGroup.messages.push(message);
        currentGroup.timestamp = message.createdAt;
      } else {
        // Too much time gap, start new group
        currentGroup = {
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          messages: [message],
          timestamp: message.createdAt,
        };
        groups.push(currentGroup);
      }
    }
  });

  return groups;
}

/**
 * Format message timestamp
 */
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (messageDate.getTime() === today.getTime()) {
    return timeStr; // "2:30 PM"
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  }

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (messageDate >= weekAgo) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format conversation preview time
 */
export function formatConversationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get message preview text
 */
export function getMessagePreview(message: Message): string {
  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    switch (attachment.type) {
      case 'image':
        return '📷 Photo';
      case 'document':
        return '📄 Document';
      case 'pdf':
        return '📋 PDF';
      default:
        return '📎 Attachment';
    }
  }

  return message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text;
}

/**
 * Get unread count for user in conversation
 */
export function getUnreadCountForUser(conversation: Conversation, userId: string): number {
  return conversation.unreadCount[userId] || 0;
}

/**
 * Get participant info excluding current user
 */
export function getOtherParticipants(
  conversation: Conversation,
  currentUserId: string
): ConversationParticipant[] {
  return conversation.participants
    .filter(p => p.userId !== currentUserId)
    .map(p => ({
      userId: p.userId,
      userName: p.userName,
      userRole: p.userRole,
    }));
}

/**
 * Format participant names
 */
export function formatParticipantNames(participants: ConversationParticipant[]): string {
  if (participants.length === 0) return 'Unknown';
  if (participants.length === 1) return participants[0].userName;
  if (participants.length === 2) return `${participants[0].userName}, ${participants[1].userName}`;
  return `${participants[0].userName} +${participants.length - 1}`;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'body_shop':
      return '#007AFF';
    case 'insurance_adjuster':
      return '#FF9500';
    case 'customer':
      return '#34C759';
    default:
      return '#8E8E93';
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'body_shop':
      return 'Body Shop';
    case 'insurance_adjuster':
      return 'Adjuster';
    case 'customer':
      return 'Customer';
    default:
      return role;
  }
}

/**
 * Validate message text
 */
export function validateMessageText(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (text.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { valid: true };
}

/**
 * Validate attachment
 */
export function validateAttachment(attachment: {
  uri: string;
  type: string;
  size: number;
}): {
  valid: boolean;
  error?: string;
} {
  // Max 10MB
  const maxSize = 10 * 1024 * 1024;

  if (attachment.size > maxSize) {
    return { valid: false, error: 'File is too large (max 10MB)' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
  if (!allowedTypes.includes(attachment.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
}

/**
 * Sort conversations by last message time
 */
export function sortConversationsByTime(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = a.lastMessage?.createdAt.getTime() || a.updatedAt.getTime();
    const timeB = b.lastMessage?.createdAt.getTime() || b.updatedAt.getTime();
    return timeB - timeA; // Newest first
  });
}

/**
 * Filter conversations by search query
 */
export function filterConversations(
  conversations: Conversation[],
  query: string
): Conversation[] {
  if (!query || query.trim().length === 0) return conversations;

  const lowerQuery = query.toLowerCase();

  return conversations.filter(conversation => {
    // Search in participant names
    const participantMatch = conversation.participants.some(p =>
      p.userName.toLowerCase().includes(lowerQuery)
    );

    // Search in last message
    const messageMatch = conversation.lastMessage?.text.toLowerCase().includes(lowerQuery);

    return participantMatch || messageMatch;
  });
}

/**
 * Mark messages as read
 */
export function markMessagesAsRead(
  messages: Message[],
  currentUserId: string
): Message[] {
  return messages.map(message => {
    if (message.senderId !== currentUserId && message.status !== 'read') {
      return {
        ...message,
        status: 'read',
        readAt: new Date(),
      };
    }
    return message;
  });
}

/**
 * Get typing indicator text
 */
export function getTypingIndicatorText(
  participants: ConversationParticipant[],
  currentUserId: string
): string | null {
  const typing = participants.filter(p => p.userId !== currentUserId && p.isTyping);

  if (typing.length === 0) return null;
  if (typing.length === 1) return `${typing[0].userName} is typing...`;
  if (typing.length === 2) return `${typing[0].userName} and ${typing[1].userName} are typing...`;
  return 'Several people are typing...';
}

/**
 * Quick reply suggestions
 */
export const QUICK_REPLIES = {
  customer: [
    'Thanks for the update!',
    'When will it be ready?',
    'Can I see more photos?',
    'What are my options?',
    'I have a question',
  ],
  body_shop: [
    'I\'ll need more photos',
    'Estimate is ready to view',
    'Parts have arrived',
    'Vehicle is ready for pickup',
    'Let me check on that',
  ],
  insurance_adjuster: [
    'Approved for repair',
    'Need additional documentation',
    'Processing your claim',
    'Please provide more details',
    'Claim has been reviewed',
  ],
};

/**
 * Get quick replies for role
 */
export function getQuickReplies(role: UserRole): string[] {
  return QUICK_REPLIES[role] || [];
}
