import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import EscalationsScreen from './src/screens/EscalationsScreen';
import LearningScreen from './src/screens/LearningScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

// Types
type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Chats: undefined;
  Escalations: undefined;
  Learning: undefined;
  Settings: undefined;
};

type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { chatId: string; guestName: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

// Chat Stack Navigator
function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen 
        name="ChatList" 
        component={ChatsScreen}
        options={{ title: 'Active Chats' }}
      />
      <ChatStack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.guestName || 'Chat' 
        })}
      />
    </ChatStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          switch(route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Chats':
              iconName = 'chat';
              break;
            case 'Escalations':
              iconName = 'warning';
              break;
            case 'Learning':
              iconName = 'psychology';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen 
        name="Chats" 
        component={ChatStackScreen}
        options={{
          tabBarBadge: undefined, // Will be updated with unread count
        }}
      />
      <Tab.Screen 
        name="Escalations" 
        component={EscalationsScreen}
        options={{
          tabBarBadge: undefined, // Will be updated with escalation count
        }}
      />
      <Tab.Screen name="Learning" component={LearningScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Configure Push Notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
        // Send token to backend
        AsyncStorage.setItem('push_token', token.token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Handle notification based on type
        if (notification.data?.type === 'chat_escalation') {
          // Navigate to escalations
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels for Android
    PushNotification.createChannel(
      {
        channelId: 'escalation-channel',
        channelName: 'Chat Escalations',
        channelDescription: 'Notifications for chat escalations',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );

    // Check authentication
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    // Loading state
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;