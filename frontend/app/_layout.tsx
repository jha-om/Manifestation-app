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
          console.log('[RootLayout] Notifications module not available');
          return;
        }

        // Create Android notification channel FIRST (required for Android 8+)
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('daily-reminders', {
            name: 'Daily Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC,
            enableVibrate: true,
            showBadge: true,
          });
          console.log('[RootLayout] Notification channel "daily-reminders" created');
        }

        // Configure how notifications are displayed when app is in foreground
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
          contentStyle: { backgroundColor: '#F5F0FF' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
