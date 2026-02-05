import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useAffirmationStore } from '../../store/affirmationStore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const { settings, fetchSettings, updateSettings } = useAffirmationStore();
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    await fetchSettings();
    setNotificationsEnabled(settings?.notifications_enabled || false);
    setLoading(false);
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      setNotificationsEnabled(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Notification permissions are required to set reminders.');
        return;
      }
    }

    setNotificationsEnabled(value);
    await updateSettings({ notifications_enabled: value });

    if (value) {
      scheduleNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const scheduleNotifications = async () => {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const morningTime = settings?.morning_time || '08:00';
    const nightTime = settings?.night_time || '20:00';

    // Schedule morning notification
    const [morningHour, morningMinute] = morningTime.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Good Morning! 🌅',
        body: 'Start your day with positive affirmations.',
        sound: true,
      },
      trigger: {
        hour: morningHour,
        minute: morningMinute,
        repeats: true,
      },
    });

    // Schedule night notification
    const [nightHour, nightMinute] = nightTime.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evening Reflection 🌙',
        body: 'End your day with gratitude and affirmations.',
        sound: true,
      },
      trigger: {
        hour: nightHour,
        minute: nightMinute,
        repeats: true,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color="#9370DB" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily Reminders</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications for your practice
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E0E0E0', true: '#D4C4F9' }}
                thumbColor={notificationsEnabled ? '#9370DB' : '#f4f3f4'}
              />
            </View>

            {notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.timeRow}>
                  <Ionicons name="sunny" size={24} color="#FFB347" />
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Morning</Text>
                    <Text style={styles.timeValue}>{settings?.morning_time || '08:00'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <View style={styles.timeRow}>
                  <Ionicons name="moon" size={24} color="#9370DB" />
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>Night</Text>
                    <Text style={styles.timeValue}>{settings?.night_time || '20:00'}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Your Stats</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={28} color="#FF6B6B" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{settings?.current_streak || 0} days</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={28} color="#FFD700" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Longest Streak</Text>
                <Text style={styles.statValue}>{settings?.longest_streak || 0} days</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={28} color="#9370DB" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Last Practice</Text>
                <Text style={styles.statValue}>
                  {settings?.last_practice_date || 'Not yet'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Manifest is designed to help you build a daily affirmation practice,
              track your consistency, and manifest positive change in your life.
            </Text>
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="quote" size={32} color="#9370DB" />
          <Text style={styles.quoteText}>
            "What you think, you become. What you feel, you attract.
            What you imagine, you create."
          </Text>
          <Text style={styles.quoteAuthor}>- Buddha</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  aboutText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  versionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6E6FA',
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginTop: 16,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#9370DB',
    fontWeight: '600',
    marginTop: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
