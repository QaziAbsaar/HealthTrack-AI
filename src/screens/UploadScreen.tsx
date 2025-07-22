import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MedicalReport, ReportType } from '../types/index';
import OCRService from '../services/OCRService';
import StorageService from '../services/StorageService';
import parserUtils from '../utils/parserUtils';
import FilePicker from '../components/FilePicker';
import OCRCorrectionModal from '../components/OCRCorrectionModal';

export default function UploadScreen({ navigation }: any) {
  const { theme, colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].mimeType?.startsWith('image/')) {
          setSelectedImage(result.assets[0].uri);
          await processImage(result.assets[0].uri);
        } else {
          Alert.alert('Unsupported Format', 'PDF processing will be added in a future update. Please use image files for now.');
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      setLoading(true);
      
      // Extract text using OCR
      const result = await OCRService.extractTextFromImage(imageUri);
      setOcrResult(result);
      setExtractedText(result.text);
      
      if (result.text.trim()) {
        // Show correction modal for user to review/edit
        setShowCorrectionModal(true);
      } else {
        Alert.alert('No Text Found', 'No text could be extracted from this image. Please try a clearer image.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Processing Error', 'Failed to extract text from image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextCorrected = async (correctedText: string, reportType: ReportType, title: string) => {
    try {
      setLoading(true);
      
      // Parse the corrected text
      const parsedData = parserUtils.parseMedicalText(correctedText, reportType);
      
      // Create new report
      const newReport: MedicalReport = {
        id: Date.now().toString(),
        title: title || `${reportType.replace('_', ' ')} Report`,
        type: reportType,
        dateCreated: new Date(),
        originalImageUri: selectedImage,
        extractedText: extractedText,
        correctedText: correctedText,
        parsedData: parsedData,
        tags: [reportType.replace('_', ' ')],
        isBookmarked: false,
      };

      // Save to storage
      await StorageService.saveReport(newReport);
      
      setShowCorrectionModal(false);
      
      Alert.alert(
        'Success',
        'Report has been saved successfully!',
        [
          {
            text: 'View Report',
            onPress: () => navigation.navigate('ReportDetail', { reportId: newReport.id }),
          },
          {
            text: 'Upload Another',
            onPress: resetUpload,
          },
        ]
      );
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setExtractedText('');
    setOcrResult(null);
    setShowCorrectionModal(false);
  };

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
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: isRTL ? 0 : 15, marginLeft: isRTL ? 15 : 0 }}
          >
            <Ionicons 
              name={isRTL ? 'chevron-forward' : 'chevron-back'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            flex: 1,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {t('uploadReport')}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <View style={{
              backgroundColor: colors.surface,
              padding: 30,
              borderRadius: 15,
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{
                color: colors.text,
                marginTop: 15,
                fontSize: 16,
              }}>
                {t('processing')}
              </Text>
            </View>
          </View>
        )}

        {!selectedImage ? (
          /* Upload Options */
          <View>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 40,
              lineHeight: 24,
            }}>
              Choose how you'd like to upload your medical report
            </Text>

            <FilePicker
              onTakePhoto={handleTakePhoto}
              onSelectFile={handleSelectFile}
              colors={colors}
              isRTL={isRTL}
              t={t}
            />

            {/* Tips */}
            <View style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 12,
              marginTop: 30,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 12,
                textAlign: isRTL ? 'right' : 'left',
              }}>
                📝 Tips for better results:
              </Text>
              
              <View style={{ gap: 8 }}>
                {[
                  'Ensure good lighting when taking photos',
                  'Keep the camera steady and focused',
                  'Capture the entire document in frame',
                  'Avoid shadows and glare on the document',
                  'Use high resolution images when possible'
                ].map((tip, index) => (
                  <Text key={index} style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                    lineHeight: 20,
                  }}>
                    • {tip}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* Processing Complete */
          <View>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              Processing Complete
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 30,
            }}>
              Text has been extracted from your image. You can review and edit it before saving.
            </Text>

            <TouchableOpacity
              onPress={resetUpload}
              style={{
                backgroundColor: colors.surface,
                padding: 15,
                borderRadius: 12,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={colors.primary} 
                style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
              />
              <Text style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: '500',
              }}>
                Upload Another Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* OCR Correction Modal */}
      <OCRCorrectionModal
        visible={showCorrectionModal}
        extractedText={extractedText}
        onSave={handleTextCorrected}
        onClose={() => setShowCorrectionModal(false)}
        colors={colors}
        isRTL={isRTL}
        t={t}
      />
    </SafeAreaView>
  );
}
