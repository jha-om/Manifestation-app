import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAffirmationStore } from '../../store/affirmationStore';

export default function HomeScreen() {
  const { affirmations, fetchAffirmations, addAffirmation, updateAffirmation, deleteAffirmation } = useAffirmationStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAffirmation, setEditingAffirmation] = useState<any>(null);
  const [affirmationText, setAffirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAffirmations();
  }, []);

  const loadAffirmations = async () => {
    setLoading(true);
    await fetchAffirmations();
    setLoading(false);
  };

  const handleAddAffirmation = async () => {
    if (!affirmationText.trim()) {
      Alert.alert('Error', 'Please enter an affirmation');
      return;
    }

    try {
      if (editingAffirmation) {
        await updateAffirmation(editingAffirmation.id, { text: affirmationText });
      } else {
        await addAffirmation(affirmationText);
      }
      setModalVisible(false);
      setAffirmationText('');
      setEditingAffirmation(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save affirmation');
    }
  };

  const handleEditAffirmation = (affirmation: any) => {
    setEditingAffirmation(affirmation);
    setAffirmationText(affirmation.text);
    setModalVisible(true);
  };

  const handleDeleteAffirmation = (id: string) => {
    Alert.alert(
      'Delete Affirmation',
      'Are you sure you want to delete this affirmation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAffirmation(id),
        },
      ]
    );
  };

  const openAddModal = () => {
    setEditingAffirmation(null);
    setAffirmationText('');
    setModalVisible(true);
  };

  const renderAffirmationItem = ({ item, index }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.affirmationCard}>
          <View style={styles.affirmationContent}>
            <Ionicons name="star" size={20} color="#FFD700" style={styles.starIcon} />
            <Text style={styles.affirmationText}>{item.text}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEditAffirmation(item)}
              style={styles.iconButton}
            >
              <Ionicons name="create-outline" size={22} color="#9370DB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteAffirmation(item.id)}
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Affirmations</Text>
          <Text style={styles.headerSubtitle}>{affirmations.length} affirmations</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Affirmations List */}
      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : affirmations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flower-outline" size={80} color="#DDD" />
          <Text style={styles.emptyTitle}>No Affirmations Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first affirmation to begin</Text>
        </View>
      ) : (
        <FlatList
          data={affirmations}
          renderItem={renderAffirmationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAffirmation ? 'Edit Affirmation' : 'New Affirmation'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your affirmation..."
              value={affirmationText}
              onChangeText={setAffirmationText}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddAffirmation}>
              <Text style={styles.saveButtonText}>
                {editingAffirmation ? 'Update' : 'Add'} Affirmation
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9370DB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9370DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listContent: {
    padding: 16,
  },
  affirmationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  affirmationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  starIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  affirmationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  iconButton: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F0FF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#9370DB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
