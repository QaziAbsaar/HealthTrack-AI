import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import UploadScreen from './src/screens/UploadScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Context Providers
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Services
import StorageService from './src/services/StorageService';
import CalendarService from './src/services/CalendarService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ReportDetail" 
        component={ReportDetailScreen}
        options={{ 
          title: 'Report Details',
          headerBackTitleVisible: false 
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{ title: 'Upload' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen 
        name="Assistant" 
        component={AssistantScreen}
        options={{ title: 'Assistant' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize services when app starts
    const initializeServices = async () => {
      try {
        console.log('Initializing StorageService...');
        await StorageService.initialize();
        console.log('StorageService initialized successfully');
        
        console.log('Initializing CalendarService...');
        await CalendarService.initialize();
        console.log('CalendarService initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <PaperProvider>
            <NavigationContainer>
              <MainTabs />
              <StatusBar style="auto" />
            </NavigationContainer>
          </PaperProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
