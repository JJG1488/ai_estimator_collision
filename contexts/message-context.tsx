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

  // Debounce timers for batch saves
  const conversationsTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const saveConversations = useCallback(async (conversationsToSave: Conversation[]) => {
    try {
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversationsToSave));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, []);

  const debouncedSaveConversations = useCallback((conversationsToSave: Conversation[]) => {
    if (conversationsTimerRef.current) {
      clearTimeout(conversationsTimerRef.current);
    }
    conversationsTimerRef.current = setTimeout(() => {
      saveConversations(conversationsToSave);
    }, 500); // 500ms debounce for messaging
  }, [saveConversations]);

  const saveMessages = useCallback(async (messagesToSave: { [conversationId: string]: Message[] }) => {
    try {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, []);

  const debouncedSaveMessages = useCallback((messagesToSave: { [conversationId: string]: Message[] }) => {
    if (messagesTimerRef.current) {
      clearTimeout(messagesTimerRef.current);
    }
    messagesTimerRef.current = setTimeout(() => {
      saveMessages(messagesToSave);
    }, 500); // 500ms debounce for messaging
  }, [saveMessages]);

  // Load conversations and messages from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save conversations to AsyncStorage whenever they change (debounced)
  useEffect(() => {
    if (!loading) {
      debouncedSaveConversations(conversations);
    }
  }, [conversations, loading, debouncedSaveConversations]);

  // Save messages to AsyncStorage whenever they change (debounced)
  useEffect(() => {
    if (!loading) {
      debouncedSaveMessages(messages);
    }
  }, [messages, loading, debouncedSaveMessages]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (conversationsTimerRef.current) {
        clearTimeout(conversationsTimerRef.current);
      }
      if (messagesTimerRef.current) {
        clearTimeout(messagesTimerRef.current);
      }
    };
  }, []);

  const createConversation = useCallback(async (
    claimId: string,
    participants: { userId: string; userName: string; userRole: UserRole }[]
  ): Promise<Conversation> => {
    let existingOrNew: Conversation | null = null;

    // Use functional update to check and create conversation
    setConversations(prevConversations => {
      // Check if conversation already exists for this claim
      const existing = prevConversations.find((conv) => conv.claimId === claimId);
      if (existing) {
        existingOrNew = existing;
        return prevConversations; // No change needed
      }

      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        claimId,
        participants,
        unreadCount: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      existingOrNew = newConversation;
      return [...prevConversations, newConversation];
    });

    return existingOrNew!;
  }, []);

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

    // Add message to messages state using functional update
    setMessages(prevMessages => ({
      ...prevMessages,
      [conversationId]: [...(prevMessages[conversationId] || []), newMessage],
    }));

    // Update conversation with last message and increment unread counts for other participants
    setConversations(prevConversations => {
      return prevConversations.map(conversation => {
        if (conversation.id !== conversationId) return conversation;

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

        return {
          ...conversation,
          lastMessage: newMessage,
          unreadCount: updatedUnreadCount,
          updatedAt: new Date(),
        };
      });
    });

    return newMessage;
  }, []);

  const getMessages = useCallback((conversationId: string): Message[] => {
    return messages[conversationId] || [];
  }, [messages]);

  const markAsRead = useCallback(async (conversationId: string, userId: string): Promise<void> => {
    // Mark all messages in the conversation as read using functional update
    setMessages(prevMessages => {
      const conversationMessages = prevMessages[conversationId] || [];
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

      return {
        ...prevMessages,
        [conversationId]: updatedMessages,
      };
    });

    // Reset unread count for this user using functional update
    setConversations(prevConversations => {
      return prevConversations.map(conversation => {
        if (conversation.id !== conversationId) return conversation;

        const updatedUnreadCount = { ...conversation.unreadCount };
        updatedUnreadCount[userId] = 0;

        return {
          ...conversation,
          unreadCount: updatedUnreadCount,
          updatedAt: new Date(),
        };
      });
    });
  }, []);

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
    // Find the message and add the attachment using functional update
    setMessages(prevMessages => {
      const updatedMessages = { ...prevMessages };

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

      return updatedMessages;
    });
  }, []);

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
