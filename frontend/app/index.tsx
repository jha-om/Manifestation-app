import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Seed example affirmations on first launch
      const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/affirmations/seed`, {
        method: 'POST',
      });
      await response.json();
    } catch (error) {
      console.log('Seed error (this is okay):', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E6E6FA', '#FFE5D9', '#D4F1F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Lotus Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="flower-outline" size={100} color="#9370DB" />
          </View>

          <Text style={styles.title}>Manifest</Text>
          <Text style={styles.subtitle}>Daily Affirmations & Positive Energy</Text>

          <Text style={styles.description}>
            Transform your mindset through the power of daily affirmations.
            Build consistency, track your progress, and manifest your dreams.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Preparing...' : 'Begin Your Journey'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={24} color="#9370DB" />
              <Text style={styles.featureText}>Daily Practice</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={24} color="#9370DB" />
              <Text style={styles.featureText}>Track Streaks</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="notifications" size={24} color="#9370DB" />
              <Text style={styles.featureText}>Reminders</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8B4789',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 340,
  },
  button: {
    backgroundColor: '#9370DB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 48,
  },
  feature: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
