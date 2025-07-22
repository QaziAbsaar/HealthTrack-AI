import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicalReport, ReportType } from '../types/index';
import langUtils from '../utils/langUtils';

interface ReportCardProps {
  report: MedicalReport;
  onPress: (reportId: string) => void;
  colors: any;
  isRTL: boolean;
  language: 'en' | 'ur' | 'ar';
}

const getReportTypeIcon = (type: ReportType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case ReportType.BLOOD_TEST:
    case ReportType.LABORATORY:
      return 'water';
    case ReportType.PRESCRIPTION:
      return 'medical';
    case ReportType.XRAY:
      return 'scan';
    case ReportType.MRI:
    case ReportType.CT_SCAN:
      return 'scan-circle';
    case ReportType.DIAGNOSTIC:
      return 'analytics';
    case ReportType.VACCINATION:
      return 'shield-checkmark';
    case ReportType.CONSULTATION:
      return 'people';
    default:
      return 'document-text';
  }
};

const getReportTypeColor = (type: ReportType): string => {
  switch (type) {
    case ReportType.BLOOD_TEST:
    case ReportType.LABORATORY:
      return '#ef4444'; // red
    case ReportType.PRESCRIPTION:
      return '#10b981'; // green
    case ReportType.XRAY:
    case ReportType.MRI:
    case ReportType.CT_SCAN:
      return '#3b82f6'; // blue
    case ReportType.DIAGNOSTIC:
      return '#8b5cf6'; // purple
    case ReportType.VACCINATION:
      return '#06b6d4'; // cyan
    case ReportType.CONSULTATION:
      return '#f59e0b'; // yellow
    default:
      return '#6b7280'; // gray
  }
};

const formatReportType = (type: ReportType): string => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function ReportCard({ report, onPress, colors, isRTL, language }: ReportCardProps) {
  const reportTypeColor = getReportTypeColor(report.type);
  const reportTypeIcon = getReportTypeIcon(report.type);
  const formattedDate = langUtils.formatDate(report.dateCreated, language);
  const relativeTime = langUtils.getRelativeTime(report.dateCreated, language);

  return (
    <TouchableOpacity
      onPress={() => onPress(report.id)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <View style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
      }}>
        {/* Report Type Icon */}
        <View style={{
          backgroundColor: reportTypeColor + '20',
          borderRadius: 8,
          padding: 8,
          marginRight: isRTL ? 0 : 12,
          marginLeft: isRTL ? 12 : 0,
        }}>
          <Ionicons 
            name={reportTypeIcon} 
            size={20} 
            color={reportTypeColor} 
          />
        </View>

        {/* Report Info */}
        <View style={{ flex: 1 }}>
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              flex: 1,
              textAlign: isRTL ? 'right' : 'left',
            }} numberOfLines={2}>
              {report.title}
            </Text>
            
            {report.isBookmarked && (
              <Ionicons 
                name="bookmark" 
                size={16} 
                color={colors.primary} 
                style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
              />
            )}
          </View>

          <Text style={{
            fontSize: 12,
            color: reportTypeColor,
            fontWeight: '500',
            textAlign: isRTL ? 'right' : 'left',
            marginBottom: 4,
          }}>
            {formatReportType(report.type)}
          </Text>

          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {formattedDate} • {relativeTime}
          </Text>
        </View>
      </View>

      {/* Tags */}
      {report.tags && report.tags.length > 0 && (
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          flexWrap: 'wrap',
          marginTop: 8,
          gap: 6,
        }}>
          {report.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.primary + '15',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text style={{
                fontSize: 10,
                color: colors.primary,
                fontWeight: '500',
              }}>
                {tag}
              </Text>
            </View>
          ))}
          {report.tags.length > 3 && (
            <View style={{
              backgroundColor: colors.border,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}>
              <Text style={{
                fontSize: 10,
                color: colors.textSecondary,
                fontWeight: '500',
              }}>
                +{report.tags.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Summary Preview */}
      {report.summary && (
        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
          marginTop: 8,
          lineHeight: 16,
          textAlign: isRTL ? 'right' : 'left',
        }} numberOfLines={2}>
          {report.summary}
        </Text>
      )}
    </TouchableOpacity>
  );
}
