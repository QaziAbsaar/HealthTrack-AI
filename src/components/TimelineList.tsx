import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MedicalReport } from '../types/index';
import ReportCard from './ReportCard';

interface TimelineListProps {
  reports: MedicalReport[];
  onReportPress: (reportId: string) => void;
  theme: 'light' | 'dark';
  colors: any;
  isRTL: boolean;
}

export default function TimelineList({ 
  reports, 
  onReportPress, 
  theme, 
  colors, 
  isRTL 
}: TimelineListProps) {
  
  const renderReport = ({ item }: { item: MedicalReport }) => (
    <ReportCard
      report={item}
      onPress={onReportPress}
      colors={colors}
      isRTL={isRTL}
      language="en" // This should come from context in a real app
    />
  );

  if (reports.length === 0) {
    return (
      <View style={{
        padding: 20,
        alignItems: 'center',
      }}>
        <Text style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
        }}>
          No reports to display
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      renderItem={renderReport}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
