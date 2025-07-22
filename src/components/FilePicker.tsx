import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilePickerProps {
  onTakePhoto: () => void;
  onSelectFile: () => void;
  colors: any;
  isRTL: boolean;
  t: (key: string) => string;
}

export default function FilePicker({ 
  onTakePhoto, 
  onSelectFile, 
  colors, 
  isRTL, 
  t 
}: FilePickerProps) {
  return (
    <View style={{ gap: 15 }}>
      {/* Take Photo Option */}
      <TouchableOpacity
        onPress={onTakePhoto}
        style={{
          backgroundColor: colors.primary,
          padding: 20,
          borderRadius: 15,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
        }}
      >
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 50,
          padding: 12,
          marginRight: isRTL ? 0 : 15,
          marginLeft: isRTL ? 15 : 0,
        }}>
          <Ionicons name="camera" size={24} color="white" />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {t('takePhoto')}
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            marginTop: 2,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            Use camera to capture report
          </Text>
        </View>
      </TouchableOpacity>

      {/* Select File Option */}
      <TouchableOpacity
        onPress={onSelectFile}
        style={{
          backgroundColor: colors.surface,
          padding: 20,
          borderRadius: 15,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.border,
          borderStyle: 'dashed',
        }}
      >
        <View style={{
          backgroundColor: colors.primary + '20',
          borderRadius: 50,
          padding: 12,
          marginRight: isRTL ? 0 : 15,
          marginLeft: isRTL ? 15 : 0,
        }}>
          <Ionicons name="document" size={24} color={colors.primary} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: '600',
            textAlign: isRTL ? 'right' : 'left',
          }}>
            {t('selectFile')}
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginTop: 2,
            textAlign: isRTL ? 'right' : 'left',
          }}>
            Choose from gallery or files
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
