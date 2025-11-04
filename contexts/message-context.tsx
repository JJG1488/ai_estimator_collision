import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Conversation,
  Message,
  MessageAttachment,
  UserRole,
} from '@/types';
import { notifyNewMessage } from '@/services/notification-service';

interface MessageContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  loading: boolean;

  // Conversation management
  createConversation: (claimId: string, participants: { userId: string; userName: string; userRole: UserRole }[]) => Promise<Conversation>;
  getConversation: (conversationId: string) => Conversation | undefined;
  getConversationByClaimId: (claimId: string) => Conversation | undefined;

  // Message management
  sendMessage: (conversationId: string, senderId: string, senderRole: UserRole, senderName: string, text: string, attachments?: MessageAttachment[]) => Promise<Message>;
  getMessages: (conversationId: string) => Message[];
  markAsRead: (conversationId: string, userId: string) => Promise<void>;

  // Unread counts
  getUnreadCount: (conversationId: string, userId: string) => number;
  getTotalUnreadCount: (userId: string) => number;

  // Document attachment
  addAttachment: (messageId: string, attachment: MessageAttachment) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const CONVERSATIONS_KEY = '@collision_repair:conversations';
const MESSAGES_KEY = '@collision_repair:messages';

export function MessageProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [conversationsJson, messagesJson] = await Promise.all([
        AsyncStorage.getItem(CONVERSATIONS_KEY),
        AsyncStorage.getItem(MESSAGES_KEY),
      ]);

      if (conversationsJson) {
        const parsedConversations = JSON.parse(conversationsJson);
        // Parse dates
        const conversationsWithDates = parsedConversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          lastMessage: conv.lastMessage ? {
            ...conv.lastMessage,
            createdAt: new Date(conv.lastMessage.createdAt),
            readAt: conv.lastMessage.readAt ? new Date(conv.lastMessage.readAt) : undefined,
          } : undefined,
        }));
        setConversations(conversationsWithDates);
      }

      if (messagesJson) {
        const parsedMessages = JSON.parse(messagesJson);
        // Parse dates in messages
        const messagesWithDates: { [key: string]: Message[] } = {};
        Object.keys(parsedMessages).forEach((convId) => {
          messagesWithDates[convId] = parsedMessages[convId].map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
            readAt: msg.readAt ? new Date(msg.readAt) : undefined,
            attachments: msg.attachments?.map((att: any) => ({
              ...att,
              uploadedAt: new Date(att.uploadedAt),
            })),
          }));
        });
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConversations = useCallback(async () => {
    try {
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, [conversations]);

  const saveMessages = useCallback(async () => {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, [messages]);

  // Load conversations and messages from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save conversations to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveConversations();
    }
  }, [conversations, loading, saveConversations]);

  // Save messages to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveMessages();
    }
  }, [messages, loading, saveMessages]);

  const createConversation = useCallback(async (
    claimId: string,
    participants: { userId: string; userName: string; userRole: UserRole }[]
  ): Promise<Conversation> => {
    // Check if conversation already exists for this claim
    const existing = conversations.find((conv) => conv.claimId === claimId);
    if (existing) {
      return existing;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      claimId,
      participants,
      unreadCount: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations([...conversations, newConversation]);
    return newConversation;
  }, [conversations]);

  const getConversation = useCallback((conversationId: string): Conversation | undefined => {
    return conversations.find((conv) => conv.id === conversationId);
  }, [conversations]);

  const getConversationByClaimId = useCallback((claimId: string): Conversation | undefined => {
    return conversations.find((conv) => conv.claimId === claimId);
  }, [conversations]);

  const sendMessage = useCallback(async (
    conversationId: string,
    senderId: string,
    senderRole: UserRole,
    senderName: string,
    text: string,
    attachments?: MessageAttachment[]
  ): Promise<Message> => {
    const conversation = getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      conversationId,
      senderId,
      senderRole,
      senderName,
      text,
      attachments,
      status: 'sent',
      createdAt: new Date(),
    };

    // Add message to messages state
    const conversationMessages = messages[conversationId] || [];
    setMessages({
      ...messages,
      [conversationId]: [...conversationMessages, newMessage],
    });

    // Update conversation with last message and increment unread counts for other participants
    const updatedUnreadCount = { ...conversation.unreadCount };
    conversation.participants.forEach((participant) => {
      if (participant.userId !== senderId) {
        updatedUnreadCount[participant.userId] = (updatedUnreadCount[participant.userId] || 0) + 1;

        // Send notification to other participants
        try {
          notifyNewMessage(senderName, text, conversationId);
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    });

    const updatedConversation: Conversation = {
      ...conversation,
      lastMessage: newMessage,
      unreadCount: updatedUnreadCount,
      updatedAt: new Date(),
    };

    setConversations(
      conversations.map((conv) => (conv.id === conversationId ? updatedConversation : conv))
    );

    return newMessage;
  }, [getConversation, messages, conversations]);

  const getMessages = useCallback((conversationId: string): Message[] => {
    return messages[conversationId] || [];
  }, [messages]);

  const markAsRead = useCallback(async (conversationId: string, userId: string): Promise<void> => {
    const conversation = getConversation(conversationId);
    if (!conversation) {
      return;
    }

    // Mark all messages in the conversation as read
    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = conversationMessages.map((msg) => {
      if (msg.senderId !== userId && !msg.readAt) {
        return {
          ...msg,
          status: 'read' as const,
          readAt: new Date(),
        };
      }
      return msg;
    });

    setMessages({
      ...messages,
      [conversationId]: updatedMessages,
    });

    // Reset unread count for this user
    const updatedUnreadCount = { ...conversation.unreadCount };
    updatedUnreadCount[userId] = 0;

    const updatedConversation: Conversation = {
      ...conversation,
      unreadCount: updatedUnreadCount,
      updatedAt: new Date(),
    };

    setConversations(
      conversations.map((conv) => (conv.id === conversationId ? updatedConversation : conv))
    );
  }, [getConversation, messages, conversations]);

  const getUnreadCount = useCallback((conversationId: string, userId: string): number => {
    const conversation = getConversation(conversationId);
    return conversation?.unreadCount[userId] || 0;
  }, [getConversation]);

  const getTotalUnreadCount = useCallback((userId: string): number => {
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  }, [conversations]);

  const addAttachment = useCallback(async (messageId: string, attachment: MessageAttachment): Promise<void> => {
    // Find the message and add the attachment
    const updatedMessages = { ...messages };

    Object.keys(updatedMessages).forEach((convId) => {
      updatedMessages[convId] = updatedMessages[convId].map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            attachments: [...(msg.attachments || []), attachment],
          };
        }
        return msg;
      });
    });

    setMessages(updatedMessages);
  }, [messages]);

  const value = useMemo<MessageContextType>(
    () => ({
      conversations,
      messages,
      loading,
      createConversation,
      getConversation,
      getConversationByClaimId,
      sendMessage,
      getMessages,
      markAsRead,
      getUnreadCount,
      getTotalUnreadCount,
      addAttachment,
    }),
    [conversations, messages, loading, createConversation, getConversation, getConversationByClaimId, sendMessage, getMessages, markAsRead, getUnreadCount, getTotalUnreadCount, addAttachment]
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}
