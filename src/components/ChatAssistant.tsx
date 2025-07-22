import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../types/index';

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  colors: any;
  isRTL: boolean;
}

export default function ChatAssistant({ 
  messages, 
  onSendMessage, 
  colors, 
  isRTL 
}: ChatAssistantProps) {
  
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={{
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: item.isUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
      marginBottom: 12,
    }}>
      <View style={{
        backgroundColor: item.isUser ? colors.primary : colors.surface,
        padding: 12,
        borderRadius: 16,
        maxWidth: '80%',
      }}>
        <Text style={{
          color: item.isUser ? 'white' : colors.text,
          fontSize: 14,
        }}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
