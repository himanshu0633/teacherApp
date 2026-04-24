import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';

const CommonHeader = ({ title, onBack, backgroundColor, rightIcon }) => (
  <View style={[styles.headerContainer, { backgroundColor }]}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
    {rightIcon ? (
      <View style={styles.rightIconContainer}>{rightIcon}</View>
    ) : (
      <View style={styles.rightIconPlaceholder} />
    )}
  </View>
);

export default function CreateLinkScreen({ navigation }) {
  const [screen, setScreen] = useState('create');
  const [selectedClass, setSelectedClass] = useState('');
  const [link, setLink] = useState('');
  const [subject, setSubject] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [links, setLinks] = useState([
    {
      id: 1,
      className: 'Class V',
      subject: 'Computer Science',
      link: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 2,
      className: 'Class VI',
      subject: 'Mathematics',
      link: 'https://zoom.us/j/123456789',
    },
  ]);

  const classOptions = ['Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'];

  const handleSelectClass = (className) => {
    setSelectedClass(className);
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (!selectedClass) {
      Alert.alert('Required', 'Please select a class');
      return;
    }
    if (!link.trim()) {
      Alert.alert('Required', 'Please enter online class link');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter subject name');
      return;
    }

    const newLink = {
      id: Date.now(),
      className: selectedClass,
      subject: subject.trim(),
      link: link.trim(),
    };
    setLinks([newLink, ...links]);
    setSelectedClass('');
    setLink('');
    setSubject('');
    Alert.alert('Success', 'Online class link created successfully');
  };

  const handleDeleteLink = (id) => {
    Alert.alert(
      'Delete Link',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setLinks(links.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const EyeIconButton = () => (
    <TouchableOpacity onPress={() => setScreen('list')} activeOpacity={0.7}>
      <Text style={styles.eyeIcon}>👁️</Text>
    </TouchableOpacity>
  );

  const AddIconButton = () => (
    <TouchableOpacity onPress={() => setScreen('create')} activeOpacity={0.7}>
      <Text style={styles.addIcon}>+</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#4B46FF" barStyle="light-content" />
      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title={screen === 'create' ? 'Create Online Class Link' : 'Class Links List'}
          onBack={() => navigation.goBack()}
          backgroundColor="#4B46FF"
          rightIcon={screen === 'create' ? <EyeIconButton /> : <AddIconButton />}
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        {screen === 'create' ? (
          <ScrollView 
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.label}>Class <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.selectBox}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles.selectText, !selectedClass && styles.placeholderText]}>
                  {selectedClass || 'Select Class'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Online Class Link <Text style={styles.star}>*</Text></Text>
              <TextInput
                value={link}
                onChangeText={setLink}
                style={styles.input}
                placeholder="https://meet.google.com/..."
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Subject Name <Text style={styles.star}>*</Text></Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                style={styles.input}
                placeholder="e.g., Mathematics, Science"
                placeholderTextColor="#aaa"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {links.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>No links found</Text>
                <Text style={styles.emptySubText}>Tap + to create a new link</Text>
              </View>
            ) : (
              links.map(item => (
                <View key={item.id} style={styles.linkCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardSubject}>{item.subject}</Text>
                    <TouchableOpacity onPress={() => handleDeleteLink(item.id)}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardClass}>{item.className}</Text>
                  <Text style={styles.cardLink} numberOfLines={1}>{item.link}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Custom Class Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModal}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {classOptions.map((className) => (
                <TouchableOpacity
                  key={className}
                  style={styles.modalOption}
                  onPress={() => handleSelectClass(className)}
                >
                  <Text style={styles.modalOptionText}>{className}</Text>
                  {selectedClass === className && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#4B46FF',
  },
  topSafe: {
    backgroundColor: '#4B46FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  rightIconContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  rightIconPlaceholder: {
    width: 44,
  },
  eyeIcon: {
    fontSize: 28,
    color: '#fff',
  },
  addIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '600',
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4B46FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 10,
    marginTop: 6,
  },
  star: {
    color: '#FF5A5F',
  },
  selectBox: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFE',
  },
  selectText: {
    fontSize: 16,
    color: '#1E1E2F',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dropdownIcon: {
    fontSize: 18,
    color: '#4B46FF',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#1E1E2F',
    marginBottom: 24,
    backgroundColor: '#FAFAFE',
  },
  submitBtn: {
    height: 56,
    backgroundColor: '#4B46FF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4B46FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 8,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.3,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 20,
    opacity: 0.6,
    padding: 4,
  },
  cardClass: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardLink: {
    fontSize: 13,
    color: '#4B46FF',
    fontWeight: '500',
    backgroundColor: '#F3F4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '85%',
    maxHeight: '70%',
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  closeModal: {
    fontSize: 24,
    fontWeight: '500',
    color: '#9CA3AF',
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: 18,
    color: '#4B46FF',
    fontWeight: '700',
  },
});