import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportType } from '../types/index';

interface OCRCorrectionModalProps {
  visible: boolean;
  extractedText: string;
  onSave: (correctedText: string, reportType: ReportType, title: string) => void;
  onClose: () => void;
  colors: any;
  isRTL: boolean;
  t: (key: string) => string;
}

export default function OCRCorrectionModal({
  visible,
  extractedText,
  onSave,
  onClose,
  colors,
  isRTL,
  t,
}: OCRCorrectionModalProps) {
  const [correctedText, setCorrectedText] = useState(extractedText);
  const [selectedType, setSelectedType] = useState<ReportType>(ReportType.OTHER);
  const [title, setTitle] = useState('');

  const reportTypes = [
    { value: ReportType.BLOOD_TEST, label: 'Blood Test' },
    { value: ReportType.PRESCRIPTION, label: 'Prescription' },
    { value: ReportType.XRAY, label: 'X-Ray' },
    { value: ReportType.MRI, label: 'MRI' },
    { value: ReportType.CT_SCAN, label: 'CT Scan' },
    { value: ReportType.DIAGNOSTIC, label: 'Diagnostic' },
    { value: ReportType.LABORATORY, label: 'Laboratory' },
    { value: ReportType.VACCINATION, label: 'Vaccination' },
    { value: ReportType.CONSULTATION, label: 'Consultation' },
    { value: ReportType.OTHER, label: 'Other' },
  ];

  const handleSave = () => {
    if (!correctedText.trim()) {
      Alert.alert('Error', 'Please enter the report text.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the report.');
      return;
    }

    onSave(correctedText, selectedType, title);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
          }}>
            Review & Save Report
          </Text>
          
          <TouchableOpacity onPress={handleSave}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
              {t('save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Title Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              Report Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for this report..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 15,
                fontSize: 16,
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
          </View>

          {/* Report Type Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              Report Type
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  style={{
                    backgroundColor: selectedType === type.value ? colors.primary : colors.surface,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selectedType === type.value ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{
                    color: selectedType === type.value ? 'white' : colors.text,
                    fontSize: 14,
                    fontWeight: selectedType === type.value ? '600' : '400',
                  }}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Text Correction */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              Extracted Text
            </Text>
            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 12,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              Review and edit the text extracted from your image. Make any necessary corrections.
            </Text>
            
            <TextInput
              value={correctedText}
              onChangeText={setCorrectedText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              placeholder="Enter or edit the report text..."
              placeholderTextColor={colors.textSecondary}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 15,
                fontSize: 14,
                color: colors.text,
                minHeight: 200,
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
          </View>

          {/* AI Suggestion */}
          <View style={{
            backgroundColor: colors.primary + '10',
            padding: 15,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}>
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons 
                name="sparkles" 
                size={16} 
                color={colors.primary} 
                style={{ marginRight: isRTL ? 0 : 6, marginLeft: isRTL ? 6 : 0 }}
              />
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.primary,
              }}>
                AI Suggestion
              </Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              lineHeight: 16,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              The AI has detected this appears to be a medical document. Please review the extracted text for accuracy and select the appropriate report type above.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
