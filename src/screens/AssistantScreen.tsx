import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage } from '../types/index';
import StorageService from '../services/StorageService';
import SummarizerService from '../services/SummarizerService';

export default function AssistantScreen() {
  const { theme, colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const savedMessages = await StorageService.getAllChatMessages();
      setMessages(savedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      await StorageService.saveChatMessage(userMessage);

      // Get AI response
      const response = await SummarizerService.answerMedicalQuestion(userMessage.text);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.summary || 'Sorry, I could not generate a response.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await StorageService.saveChatMessage(aiMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('assistant')}
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 4,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('askQuestion')}
        </Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.textSecondary} />
              <Text style={{ 
                fontSize: 18, 
                color: colors.text, 
                marginTop: 20,
                textAlign: 'center'
              }}>
                Start a conversation
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.textSecondary,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 40,
              }}>
                Ask me questions about your health reports or general medical information
              </Text>
            </View>
          ) : (
            <View>
              {messages.map((message) => (
                <View 
                  key={message.id}
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    justifyContent: message.isUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
                    marginBottom: 12,
                  }}
                >
                  <View style={{
                    backgroundColor: message.isUser ? colors.primary : colors.surface,
                    padding: 12,
                    borderRadius: 16,
                    maxWidth: '80%',
                    borderBottomRightRadius: message.isUser && !isRTL ? 4 : 16,
                    borderBottomLeftRadius: message.isUser && isRTL ? 4 : 16,
                  }}>
                    <Text style={{
                      color: message.isUser ? 'white' : colors.text,
                      fontSize: 14,
                      lineHeight: 20,
                    }}>
                      {message.text}
                    </Text>
                    
                    <Text style={{
                      color: message.isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: isRTL ? 'left' : 'right',
                    }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
              
              {loading && (
                <View style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  justifyContent: isRTL ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}>
                  <View style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
                      AI is typing
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary }} />
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary }} />
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary }} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            backgroundColor: colors.surface,
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chatPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                maxHeight: 100,
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              style={{
                backgroundColor: inputText.trim() && !loading ? colors.primary : colors.border,
                borderRadius: 20,
                padding: 8,
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              }}
            >
              <Ionicons 
                name="send" 
                size={16} 
                color={inputText.trim() && !loading ? 'white' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
