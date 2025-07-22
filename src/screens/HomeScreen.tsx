import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MedicalReport } from '../types/index';
import StorageService from '../services/StorageService';
import ReportCard from '../components/ReportCard';
import TimelineList from '../components/TimelineList';

export default function HomeScreen({ navigation }: any) {
  const { theme, colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Wait a bit for services to initialize, then load reports
    const initAndLoad = async () => {
      try {
        // Small delay to ensure services are initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadReports();
      } catch (error) {
        console.error('Failed to initialize and load:', error);
      }
    };
    
    initAndLoad();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Retry logic in case database is still initializing
      let retries = 3;
      let allReports: MedicalReport[] = [];
      
      while (retries > 0) {
        try {
          allReports = await StorageService.getAllReports();
          break;
        } catch (error) {
          console.log(`Attempt ${4 - retries} failed, retrying...`);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      
      setReports(allReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const navigateToReport = (reportId: string) => {
    navigation.navigate('ReportDetail', { reportId });
  };

  const navigateToUpload = () => {
    navigation.navigate('Upload');
  };

  const recentReports = reports.slice(0, 5);
  const hasReports = reports.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={{
        padding: 20,
        paddingBottom: 10,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t('welcome')}
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginTop: 4,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t('recentReports')}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={navigateToUpload}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 50,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          /* Loading State */
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>Loading reports...</Text>
          </View>
        ) : !hasReports ? (
          /* Empty State */
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 100,
          }}>
            <Ionicons 
              name="document-outline" 
              size={80} 
              color={colors.textSecondary} 
              style={{ marginBottom: 20 }}
            />
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
              textAlign: 'center',
            }}>
              {t('noReports')}
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
              paddingHorizontal: 40,
              marginBottom: 30,
            }}>
              {t('uploadFirst')}
            </Text>
            
            <TouchableOpacity
              onPress={navigateToUpload}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 30,
                paddingVertical: 15,
                borderRadius: 25,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
              }}
            >
              <Ionicons name="add" size={20} color="white" style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }} />
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}>
                {t('uploadReport')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Reports List */
          <View>
            {/* Quick Stats */}
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              marginBottom: 25,
              gap: 15,
            }}>
              <View style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.primary,
                }}>
                  {reports.length}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}>
                  Total Reports
                </Text>
              </View>
              
              <View style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.success,
                }}>
                  {reports.filter((report: MedicalReport) => report.isBookmarked).length}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}>
                  Bookmarked
                </Text>
              </View>
            </View>

            {/* Recent Reports */}
            <View style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: colors.text,
                }}>
                  {t('recentReports')}
                </Text>
                
                {reports.length > 5 && (
                  <TouchableOpacity onPress={() => {}}>
                    <Text style={{
                      color: colors.primary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      View All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TimelineList
                reports={recentReports}
                onReportPress={navigateToReport}
                theme={theme}
                colors={colors}
                isRTL={isRTL}
              />
            </View>

            {/* Quick Actions */}
            <View style={{ marginTop: 20 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 15,
              }}>
                Quick Actions
              </Text>
              
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <TouchableOpacity
                  onPress={navigateToUpload}
                  style={{
                    backgroundColor: colors.surface,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons name="camera" size={18} color={colors.primary} style={{ marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('Calendar')}
                  style={{
                    backgroundColor: colors.surface,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Reminders</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('Assistant')}
                  style={{
                    backgroundColor: colors.surface,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons name="chatbubble" size={18} color={colors.primary} style={{ marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }} />
                  <Text style={{ color: colors.text, fontSize: 14 }}>Ask AI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
