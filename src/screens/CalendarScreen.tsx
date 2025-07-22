import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CalendarReminder } from '../types/index';
import StorageService from '../services/StorageService';
import CalendarService from '../services/CalendarService';

export default function CalendarScreen() {
  const { theme, colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const allReminders = await StorageService.getAllReminders();
      setReminders(allReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingReminders = CalendarService.getUpcomingReminders(reminders);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={{ padding: 20 }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('calendar')}
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 4,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('upcomingReminders')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            Loading reminders...
          </Text>
        ) : upcomingReminders.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
            <Text style={{ 
              fontSize: 18, 
              color: colors.text, 
              marginTop: 20,
              textAlign: 'center'
            }}>
              No upcoming reminders
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: 'center'
            }}>
              Add reminders to keep track of appointments and medications
            </Text>
          </View>
        ) : (
          <View>
            {upcomingReminders.map((reminder) => (
              <View key={reminder.id} style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 4,
                }}>
                  {reminder.title}
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}>
                  {CalendarService.formatDate(reminder.date)} • {CalendarService.formatTime(reminder.date)}
                </Text>
                
                {reminder.description && (
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    lineHeight: 16,
                  }}>
                    {reminder.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
