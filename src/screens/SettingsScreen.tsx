import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { t, language, setLanguage, isRTL } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

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
          {t('settings')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Theme Settings */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 15,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            Appearance
          </Text>
          
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
          }}>
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
              }}>
                <Ionicons 
                  name={theme === 'dark' ? 'moon' : 'sunny'} 
                  size={20} 
                  color={colors.primary} 
                  style={{ marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}
                />
                <Text style={{
                  fontSize: 16,
                  color: colors.text,
                  fontWeight: '500',
                }}>
                  Dark Mode
                </Text>
              </View>
              
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={theme === 'dark' ? 'white' : colors.background}
              />
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 15,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {t('language')}
          </Text>
          
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code as any)}
                style={{
                  padding: 16,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: index < languages.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    fontSize: 20, 
                    marginRight: isRTL ? 0 : 12, 
                    marginLeft: isRTL ? 12 : 0 
                  }}>
                    {lang.flag}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: '500',
                  }}>
                    {lang.name}
                  </Text>
                </View>
                
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 15,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {t('about')}
          </Text>
          
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
          }}>
            <Ionicons name="medical" size={40} color={colors.primary} />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginTop: 12,
              textAlign: 'center',
            }}>
              Medical Report Organizer
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
              textAlign: 'center',
            }}>
              Version 1.0.0
            </Text>
            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 18,
            }}>
              Built with VibeCoding x Trae{'\n'}
              AI-powered medical report management
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
