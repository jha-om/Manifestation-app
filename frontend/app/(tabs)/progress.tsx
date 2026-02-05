import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAffirmationStore } from '../../store/affirmationStore';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { settings, dailyProgress, fetchSettings, fetchTodayProgress } = useAffirmationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchSettings(), fetchTodayProgress()]);
    setLoading(false);
  };

  const getMotivationalMessage = () => {
    const streak = settings?.current_streak || 0;
    const percentage = dailyProgress?.completion_percentage || 0;

    if (percentage === 100) {
      return "You're unstoppable! All affirmations completed! 🎉";
    } else if (percentage >= 75) {
      return "Almost there! Keep up the amazing work! 💪";
    } else if (percentage >= 50) {
      return "You're doing great! Keep going! ⭐";
    } else if (percentage > 0) {
      return "Great start! Every step counts! 🌱";
    } else if (streak > 0) {
      return "Ready to continue your streak? Let's practice! 🔥";
    } else {
      return "Begin your journey today! 🌟";
    }
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
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>{getMotivationalMessage()}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Cards */}
        <View style={styles.streakContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FFE66D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <Ionicons name="flame" size={40} color="#fff" />
            <Text style={styles.streakNumber}>{settings?.current_streak || 0}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#A855F7', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <Ionicons name="trophy" size={40} color="#fff" />
            <Text style={styles.streakNumber}>{settings?.longest_streak || 0}</Text>
            <Text style={styles.streakLabel}>Best Streak</Text>
          </LinearGradient>
        </View>

        {/* Today's Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="today" size={24} color="#9370DB" />
            <Text style={styles.cardTitle}>Today's Progress</Text>
          </View>

          {/* Circular Progress */}
          <View style={styles.circularProgressContainer}>
            <View style={styles.circularProgress}>
              <View style={styles.circularProgressInner}>
                <Text style={styles.progressPercentage}>
                  {Math.round(dailyProgress?.completion_percentage || 0)}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {dailyProgress?.completed_affirmations?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {dailyProgress?.total_affirmations || 0}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {dailyProgress?.practice_count || 0}
              </Text>
              <Text style={styles.statLabel}>Practices</Text>
            </View>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Keep Going!</Text>
          </View>
          <Text style={styles.benefitsText}>
            Daily affirmations can help:
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Boost self-confidence</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Reduce negative thoughts</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Improve mental wellbeing</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Manifest positive change</Text>
            </View>
          </View>
        </View>

        {/* Encouragement */}
        {(settings?.current_streak || 0) >= 7 && (
          <View style={styles.achievementCard}>
            <Ionicons name="medal" size={48} color="#FFD700" />
            <Text style={styles.achievementTitle}>Week Warrior!</Text>
            <Text style={styles.achievementText}>
              You've maintained your practice for a full week! 🎉
            </Text>
          </View>
        )}
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
  headerSubtitle: {
    fontSize: 16,
    color: '#9370DB',
    marginTop: 8,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  streakLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9370DB',
  },
  progressLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  benefitsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
  },
  achievementCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  achievementText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
