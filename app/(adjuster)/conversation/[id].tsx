import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActionSheetIOS } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useMessage } from '@/contexts/message-context';
import { useAuth } from '@/contexts/auth-context';
import { MessageBubble } from '@/components/message-bubble';
import { ChatInput } from '@/components/chat-input';
import { MessageAttachment } from '@/types';

export default function AdjusterConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, getMessages, sendMessage, markAsRead } = useMessage();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const conversation = id ? getConversation(id) : undefined;
  const messages = id ? getMessages(id) : [];

  useEffect(() => {
    // Mark conversation as read when opened
    if (id && user) {
      markAsRead(id, user.id);
    }
  }, [id, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async (text: string) => {
    if (!id || !user || !conversation) return;

    try {
      await sendMessage(id, user.id, user.role, user.companyName, text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAttachment = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Choose Document'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handleChooseImage();
          } else if (buttonIndex === 3) {
            handleChooseDocument();
          }
        }
      );
    } else {
      Alert.alert('Add Attachment', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleChooseImage },
        { text: 'Choose Document', onPress: handleChooseDocument },
      ]);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: MessageAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image',
          size: asset.fileSize || 0,
          uploadedAt: new Date(),
        };
        await sendMessageWithAttachment(attachment);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library permission is required to choose images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: MessageAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          uri: asset.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image',
          size: asset.fileSize || 0,
          uploadedAt: new Date(),
        };
        await sendMessageWithAttachment(attachment);
      }
    } catch (error) {
      console.error('Failed to choose image:', error);
      Alert.alert('Error', 'Failed to choose image. Please try again.');
    }
  };

  const handleChooseDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: MessageAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType?.includes('pdf') ? 'pdf' : 'document',
          size: asset.size || 0,
          uploadedAt: new Date(),
        };
        await sendMessageWithAttachment(attachment);
      }
    } catch (error) {
      console.error('Failed to choose document:', error);
      Alert.alert('Error', 'Failed to choose document. Please try again.');
    }
  };

  const sendMessageWithAttachment = async (attachment: MessageAttachment) => {
    if (!id || !user || !conversation) return;

    try {
      await sendMessage(
        id,
        user.id,
        user.role,
        user.companyName,
        attachment.type === 'image' ? '📷 Photo' : `📎 ${attachment.name}`,
        [attachment]
      );
    } catch (error) {
      console.error('Failed to send attachment:', error);
      Alert.alert('Error', 'Failed to send attachment. Please try again.');
    }
  };

  if (!conversation || !user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === user.id}
          />
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <ChatInput onSend={handleSend} onAttachmentPress={handleAttachment} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
  },
});
