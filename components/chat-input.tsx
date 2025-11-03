import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttachmentPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, onAttachmentPress, placeholder = 'Type a message...', disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <View style={[styles.container, { backgroundColor: Colors.cardBackground, borderTopColor: Colors.border }]}>
        {onAttachmentPress && (
          <TouchableOpacity
            onPress={onAttachmentPress}
            disabled={disabled}
            style={styles.attachmentButton}>
            <Ionicons name="attach" size={24} color={disabled ? Colors.textSecondary : Colors.tint} />
          </TouchableOpacity>
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: Colors.text,
              backgroundColor: Colors.background,
              borderColor: Colors.border,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled || !text.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor: !text.trim() || disabled ? Colors.textSecondary : Colors.tint,
            },
          ]}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});
