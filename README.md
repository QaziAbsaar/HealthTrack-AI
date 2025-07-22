# Medical Report Organizer App 🏥

A comprehensive mobile application built with **VibeCoding x Trae** framework for organizing and managing medical reports with AI-powered OCR and analysis features.

## 🎯 Target Users

- **Caregivers** managing elderly health records
- **Individuals** tracking personal medical history  
- **Users** seeking offline access and easy summaries

## 🏗️ Technologies & Features

### Core Technologies
- **Trae Framework** - Navigation + Screen management
- **VibeCoding** - UI Components + Logic
- **Google Vision OCR API** - Text extraction from images
- **Gemma-Med / MedPalm2** - AI summaries and medical insights
- **SQLite/AsyncStorage** - Offline data storage
- **React Native** with **TypeScript**
- **Expo** development platform

### Key Features ✨

1. **📷 Document Upload & OCR**
   - Camera capture and file picker
   - Google Vision API text extraction
   - Manual text correction interface
   - PDF and image support

2. **🤖 AI-Powered Analysis**
   - Auto-categorization by report type
   - Blood test result parsing
   - Prescription data extraction
   - AI-generated summaries

3. **💾 Offline Storage**
   - SQLite database for reports
   - AsyncStorage for settings
   - Complete offline functionality

4. **📊 Smart Organization**
   - Timeline view (newest first)
   - Report categorization
   - Tagging system
   - Bookmark favorites

5. **🤖 AI Assistant**
   - Medical query answering
   - Report-specific insights
   - Health recommendations

6. **📅 Calendar & Reminders**
   - Appointment scheduling
   - Medication reminders
   - Follow-up notifications

7. **🌍 Multi-Language Support**
   - English, Urdu, Arabic
   - RTL language support
   - Language-specific formatting

8. **🎨 Theme Customization**
   - Dark/Light mode toggle
   - Custom color schemes
   - Accessibility features

## 📁 Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx           # Main dashboard
│   ├── UploadScreen.tsx         # Document upload & OCR
│   ├── ReportDetailScreen.tsx   # Individual report view
│   ├── CalendarScreen.tsx       # Reminders & appointments
│   ├── AssistantScreen.tsx      # AI chat interface
│   └── SettingsScreen.tsx       # App configuration
├── components/
│   ├── FilePicker.tsx           # Upload options UI
│   ├── ReportCard.tsx           # Report list item
│   ├── TimelineList.tsx         # Timeline view
│   ├── ChatAssistant.tsx        # Chat interface
│   └── OCRCorrectionModal.tsx   # Text editing modal
├── services/
│   ├── OCRService.ts            # Google Vision integration
│   ├── SummarizerService.ts     # AI analysis & summaries
│   ├── StorageService.ts        # Database operations
│   └── CalendarService.ts       # Reminder management
├── utils/
│   ├── parserUtils.ts           # Medical data parsing
│   └── langUtils.ts             # Internationalization
├── context/
│   ├── ThemeContext.tsx         # Theme management
│   └── LanguageContext.tsx      # Language switching
└── types/
    └── index.ts                 # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Health-Care-App
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API Keys:**

Create a `.env` file in the root directory:
```env
GOOGLE_VISION_API_KEY=your_google_vision_api_key
GEMMA_MED_API_URL=your_gemma_med_endpoint
MEDPALM2_API_URL=your_medpalm2_endpoint
LLM_API_KEY=your_llm_api_key
```

4. **Start the development server:**
```bash
npm start
```

5. **Run on device/simulator:**
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web browser
```

## 🔧 Configuration

### Google Vision OCR Setup
1. Create a Google Cloud Project
2. Enable the Vision API
3. Create service account credentials
4. Add API key to environment variables

### AI Service Integration
- Configure Gemma-Med or MedPalm2 endpoints
- Set up authentication tokens
- Update service URLs in config

### Database Schema
The app automatically creates SQLite tables on first run:
- `medical_reports` - Report data and metadata
- `calendar_reminders` - Appointments and notifications  
- `chat_messages` - AI conversation history
- `app_settings` - User preferences

## 📱 Screen Features

### 🏠 Home Screen
- Recent reports timeline
- Quick stats dashboard
- Fast action buttons
- Search and filter options

### 📤 Upload Screen  
- Camera capture
- File picker (images/PDF)
- OCR processing with progress
- Text correction interface

### 📄 Report Detail Screen
- AI-generated summary
- Parsed medical values
- Blood test results with status indicators
- Prescription details
- Original text view
- Share and bookmark options

### 📅 Calendar Screen
- Upcoming reminders
- Appointment scheduling
- Medication alerts
- Follow-up notifications

### 🤖 Assistant Screen
- Natural language queries
- Medical information lookup
- Report-specific insights
- Conversation history

### ⚙️ Settings Screen
- Theme switching (Light/Dark)
- Language selection
- Notification preferences
- App information

## 🎨 UI/UX Design Principles

### VibeCoding Design System
- **Modern Material Design** with custom medical theme
- **Accessibility-first** approach with proper contrast ratios
- **Responsive layouts** for different screen sizes
- **Smooth animations** and transitions

### Color Scheme
```typescript
// Light Theme
primary: '#0ea5e9',     // Medical blue
background: '#ffffff',  // Clean white
surface: '#f8fafc',     // Light gray
text: '#1e293b',        // Dark text
success: '#10b981',     // Health green
error: '#ef4444',       // Alert red

// Dark Theme  
primary: '#0ea5e9',     // Consistent blue
background: '#0f172a',  // Dark navy
surface: '#1e293b',     // Slate gray
text: '#f8fafc',        // Light text
```

### Typography
- **Headings:** Bold, 24-28px for main titles
- **Body:** Regular, 14-16px for content
- **Captions:** Light, 12px for metadata
- **RTL Support:** Proper text alignment for Arabic/Urdu

## 🔍 Advanced Features

### Medical Data Parsing
- **Blood Test Results:** Glucose, Hemoglobin, Cholesterol analysis
- **Prescription Data:** Medication extraction with dosage/frequency
- **Vital Signs:** Blood pressure, heart rate, temperature
- **Status Indicators:** Normal/High/Low/Critical ranges

### AI Integration
- **Context-Aware Responses:** Based on user's report history
- **Medical Terminology:** Specialized healthcare knowledge
- **Safety Features:** Disclaimers for medical advice
- **Multi-modal Analysis:** Text + image understanding

### Offline Capabilities
- **Complete App Functionality:** Works without internet
- **Local Database:** SQLite for all user data
- **Cached Responses:** Store AI results locally
- **Sync Ready:** Architecture supports future cloud sync

## 🔒 Privacy & Security

- **Local-First Storage:** All data stays on device
- **No Cloud Dependencies:** Works completely offline
- **HIPAA Considerations:** Built with healthcare privacy in mind
- **Secure API Communication:** Encrypted calls to external services

## 🧪 Testing & Development

### Development Tools
```bash
# Lint code
npm run lint

# Type checking
npx tsc --noEmit

# Test on multiple devices
npm run android
npm run ios
npm run web
```

### Mock Data
- Development mode includes realistic medical report samples
- AI services fall back to mock responses
- Database is auto-populated with test data

## 📈 Performance Optimization

- **Lazy Loading:** Components load on demand
- **Image Optimization:** Compressed and cached images
- **Database Indexing:** Fast query performance
- **Memory Management:** Efficient React Native patterns

## 🌟 Future Enhancements

### Planned Features
- **Cloud Backup:** Optional secure cloud storage
- **Family Sharing:** Multi-user account support
- **Wearable Integration:** Health data from fitness trackers
- **Telemedicine:** Video consultation integration
- **Advanced Analytics:** Health trend analysis
- **Voice Notes:** Audio recording and transcription

### Technical Roadmap
- **Push Notifications:** Reminder alerts
- **Biometric Security:** Fingerprint/Face ID
- **Export Options:** PDF report generation
- **API Integrations:** Hospital systems connectivity

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For questions and support:
- Create an issue in the GitHub repository
- Email: support@medicalorganizer.app
- Documentation: [Project Wiki](wiki-link)

## 🙏 Acknowledgments

- **VibeCoding** for the modern UI framework
- **Trae** for navigation architecture
- **Google Vision API** for OCR capabilities
- **OpenAI/Google** for AI model integration
- **Expo Team** for development platform
- **React Native Community** for ecosystem support

---

**Built with ❤️ for healthcare professionals and patients worldwide.**

*This app is designed to assist with medical record management but should not replace professional medical advice. Always consult healthcare providers for medical decisions.*
