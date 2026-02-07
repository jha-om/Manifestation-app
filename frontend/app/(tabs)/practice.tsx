import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAffirmationStore } from '../../store/affirmationStore';

const { width } = Dimensions.get('window');

export default function PracticeScreen() {
  const { affirmations, dailyProgress, fetchAffirmations, fetchTodayProgress, markAffirmationComplete } =
    useAffirmationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchAffirmations(), fetchTodayProgress()]);
    setLoading(false);
  };

  const currentAffirmation = affirmations[currentIndex];
  const isCompleted = dailyProgress?.completed_affirmations.includes(currentAffirmation?.id) || false;
  const allCompleted = dailyProgress?.completion_percentage === 100;

  const handleNext = () => {
    if (currentIndex < affirmations.length - 1) {
      animateTransition(() => setCurrentIndex(currentIndex + 1));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateTransition(() => setCurrentIndex(currentIndex - 1));
    }
  };

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 200);
  };

  const handleMarkComplete = async () => {
    if (!currentAffirmation) return;

    // Animate button
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await markAffirmationComplete(currentAffirmation.id);
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (affirmations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="flower-outline" size={80} color="#DDD" />
          <Text style={styles.emptyTitle}>No Affirmations</Text>
          <Text style={styles.emptySubtitle}>Add affirmations in the Home tab</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#9370DB', '#E6E6FA', '#FFE5D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Practice</Text>
          <Text style={styles.counter}>
            {currentIndex + 1} / {affirmations.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${dailyProgress?.completion_percentage || 0}%` },
            ]}
          />
        </View>

        {/* Affirmation Card */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.affirmationCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Visualization Image */}
            {currentAffirmation?.image && (
              <Image 
                source={{ uri: currentAffirmation.image }} 
                style={styles.visualizationImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.quoteIcon}>
              <Ionicons name="flower" size={48} color="#9370DB" />
            </View>
            
            <Text style={styles.affirmationText}>{currentAffirmation?.text}</Text>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </Animated.View>

          {/* Mark Complete Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                isCompleted && styles.completedButton,
              ]}
              onPress={handleMarkComplete}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={24}
                color="#fff"
              />
              <Text style={styles.completeButtonText}>
                {isCompleted ? 'Practice Again' : 'Mark as Complete'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {allCompleted && (
            <View style={styles.celebrationCard}>
              <Ionicons name="trophy" size={48} color="#FFD700" />
              <Text style={styles.celebrationTitle}>Amazing!</Text>
              <Text style={styles.celebrationText}>
                You've completed all affirmations today! 🎉
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={currentIndex === 0 ? '#CCC' : '#9370DB'}
            />
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            {affirmations.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === affirmations.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex === affirmations.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={28}
              color={currentIndex === affirmations.length - 1 ? '#CCC' : '#9370DB'}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  counter: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  affirmationCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    width: width - 48,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 32,
    overflow: 'hidden',
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  quoteIcon: {
    marginBottom: 24,
  },
  affirmationText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 36,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#9370DB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  celebrationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
    width: width - 48,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  celebrationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
