import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getNotificationsModule } from '../utils/notifications';

export default function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
          console.log('[RootLayout] Notifications module not available, skipping setup');
          return;
        }

        // CRITICAL: Set notification handler FIRST — without this, foreground notifications are suppressed
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        console.log('[RootLayout] Notification handler set');

        // CRITICAL: Create Android notification channel (required for Android 8+)
        // Without this, notifications are silently dropped
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('daily-reminders', {
            name: 'Daily Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });
          console.log('[RootLayout] Android notification channel "daily-reminders" created');
        }
      } catch (error) {
        console.error('[RootLayout] Failed to setup notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a1a' },
        }}
      />
    </GestureHandlerRootView>
  );
}
