import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { validateMessageText, getQuickReplies } from '@/utils/messaging';
import { UserRole } from '@/types';
import { Colors } from '@/constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttach?: () => void;
  userRole: UserRole;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onAttach,
  userRole,
  placeholder = 'Type a message...',
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const quickReplies = getQuickReplies(userRole);

  const handleSend = () => {
    const validation = validateMessageText(text);
    if (!validation.valid) {
      return;
    }

    onSend(text.trim());
    setText('');
    setShowQuickReplies(false);
  };

  const handleQuickReply = (reply: string) => {
    onSend(reply);
    setShowQuickReplies(false);
  };

  const canSend = text.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Quick Replies */}
      {showQuickReplies && quickReplies.length > 0 && (
        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplies}>
            {quickReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickReplyButton, { backgroundColor: Colors.tint + '15', borderColor: Colors.tint }]}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={[styles.quickReplyText, { color: Colors.tint }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: '#f2f2f7' }]}>
        {/* Quick Reply Toggle */}
        {quickReplies.length > 0 && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowQuickReplies(!showQuickReplies)}
            disabled={disabled}
          >
            <Text style={[styles.icon, { opacity: disabled ? 0.3 : 1 }]}>⚡</Text>
          </TouchableOpacity>
        )}

        {/* Attach Button */}
        {onAttach && (
          <TouchableOpacity style={styles.iconButton} onPress={onAttach} disabled={disabled}>
            <Text style={[styles.icon, { opacity: disabled ? 0.3 : 1 }]}>📎</Text>
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <TextInput
          style={[styles.input, { color: Colors.text, backgroundColor: '#fff' }]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.icon}
          multiline
          maxLength={5000}
          editable={!disabled}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: canSend ? Colors.tint : '#E5E5EA' }]}
          onPress={handleSend}
          disabled={!canSend || disabled}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  quickRepliesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  quickReplies: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
