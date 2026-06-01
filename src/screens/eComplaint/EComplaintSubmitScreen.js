import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Check, ChevronDown} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {
  fetchTeachers,
  getTeacherContext,
  isSuccess,
  submitComplaint,
} from './complaintApi';

const PURPLE = '#5A33C5';
const BLUE = '#079CEF';
const TEXT = '#202124';

export default function EComplaintSubmitScreen({navigation}) {
  const [teacher, setTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffPickerVisible, setStaffPickerVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      const context = await getTeacherContext();
      setTeacher(context);
      setLoadingTeachers(true);

      try {
        const list = await fetchTeachers(context.EmpCode);
        setTeachers(list);
      } catch (error) {
        console.log('E-COMPLAINT TEACHER LIST ERROR =>', error);
        Alert.alert('Error', 'Teacher list could not be loaded.');
      } finally {
        setLoadingTeachers(false);
      }
    };

    init();
  }, []);

  const selectedStaffText = useMemo(() => {
    if (!selectedStaff.length) {
      return '';
    }

    if (selectedStaff.length === 1) {
      return selectedStaff[0].label;
    }

    return `${selectedStaff.length} staff selected`;
  }, [selectedStaff]);

  const toggleStaff = item => {
    setSelectedStaff(current => {
      const exists = current.some(staff => staff.id === item.id);

      if (exists) {
        return current.filter(staff => staff.id !== item.id);
      }

      return [...current, item];
    });
  };

  const resetForm = () => {
    setLocation('');
    setDescription('');
    setSelectedStaff([]);
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      Alert.alert('Required', 'Please enter location.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required', 'Please enter complaint description.');
      return;
    }

    if (!selectedStaff.length) {
      Alert.alert('Required', 'Please select complaint staff.');
      return;
    }

    setSubmitting(true);
    try {
      const staff = `${selectedStaff.map(item => item.id).join(',')},`;
      const data = await submitComplaint({
        LocationName: location.trim(),
        description: description.trim(),
        EmpCode: teacher?.EmpCode,
        staff,
      });

      if (isSuccess(data) || String(data?.status || '').toUpperCase() === 'SUCCESS') {
        Alert.alert('Success', data?.message || data?.msg || 'Complaint submitted.');
        resetForm();
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Complaint could not be submitted.');
    } catch (error) {
      console.log('E-COMPLAINT SUBMIT ERROR =>', error);
      Alert.alert('Error', 'Complaint could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="E-Complaint"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inputBox}>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location Name *"
              placeholderTextColor={TEXT}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.84}
            style={styles.inputBox}
            onPress={() => setStaffPickerVisible(true)}>
            <Text style={[styles.selectText, !selectedStaffText && styles.placeholderText]}>
              {selectedStaffText || 'Complaint To *'}
            </Text>
            <ChevronDown size={18} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.descriptionBox}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description *"
              placeholderTextColor={TEXT}
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.84}
            style={[styles.submitButton, submitting && styles.disabledButton]}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <StaffPickerModal
        visible={staffPickerVisible}
        items={teachers}
        selected={selectedStaff}
        loading={loadingTeachers}
        onClose={() => setStaffPickerVisible(false)}
        onToggle={toggleStaff}
      />
    </View>
  );
}

function StaffPickerModal({visible, items, selected, loading, onClose, onToggle}) {
  const selectedIds = selected.map(item => item.id);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complaint To</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={PURPLE} style={styles.modalLoader} />
          ) : items.length ? (
            <ScrollView>
              {items.map(item => {
                const active = selectedIds.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.78}
                    style={styles.modalItem}
                    onPress={() => onToggle(item)}>
                    <Text style={styles.modalItemText}>{item.label}</Text>
                    {active ? <Check size={18} color={PURPLE} strokeWidth={2.4} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.emptyModalText}>Teacher list is empty.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 28, paddingTop: 28, paddingBottom: 34},
  inputBox: {
    minHeight: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {flex: 1, padding: 0, color: TEXT, fontSize: 14},
  selectText: {flex: 1, color: TEXT, fontSize: 14},
  placeholderText: {color: TEXT},
  descriptionBox: {
    minHeight: 130,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 12,
    marginBottom: 26,
  },
  descriptionInput: {minHeight: 104, padding: 0, color: TEXT, fontSize: 14},
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  disabledButton: {opacity: 0.65},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    maxHeight: '72%',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  modalHeader: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalTitle: {fontSize: 15, color: TEXT, fontWeight: '800'},
  doneText: {fontSize: 14, color: PURPLE, fontWeight: '800'},
  modalLoader: {paddingVertical: 24},
  modalItem: {
    minHeight: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalItemText: {flex: 1, fontSize: 14, color: TEXT},
  emptyModalText: {padding: 18, color: '#777', fontSize: 13},
});
