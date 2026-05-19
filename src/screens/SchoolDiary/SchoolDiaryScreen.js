import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = date => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const formatDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const parseDate = value => {
  if (!value) {
    return null;
  }

  const [day, month, year] = value.split('-').map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return startOfDay(new Date(year, month - 1, day));
};

const buildCalendarDays = monthDate => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({length: firstDay.getDay()}, () => null);
  const days = Array.from(
    {length: daysInMonth},
    (_, index) => new Date(year, month, index + 1),
  );

  return [...blanks, ...days];
};

const getTeacherContext = async () => {
  const [saved, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return status === 'true' || status === 'success';
};

export default function PostSchoolDiaryScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const androidTopInset = insets.top || StatusBar.currentHeight || 0;
  const today = startOfDay(new Date());
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [submitting, setSubmitting] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  const openCalendar = () => {
    setCalendarMonth(parseDate(date) || today);
    setCalendarVisible(true);
  };

  const changeMonth = offset => {
    setCalendarMonth(current => {
      const nextMonth = new Date(
        current.getFullYear(),
        current.getMonth() + offset,
        1,
      );

      if (
        nextMonth.getFullYear() < today.getFullYear() ||
        (nextMonth.getFullYear() === today.getFullYear() &&
          nextMonth.getMonth() < today.getMonth())
      ) {
        return current;
      }

      return startOfDay(nextMonth);
    });
  };

  const selectDate = nextDate => {
    const selected = startOfDay(nextDate);

    if (selected < today) {
      return;
    }

    setDate(formatDate(selected));
    setCalendarVisible(false);
  };

  const handleFilePick = async () => {
    try {
      const [file] = await pick({
        type: [types.images, types.pdf],
      });

      if (file) {
        setSelectedFile({
          uri: file.uri,
          name: file.name || 'school-diary-file',
          type: file.type || 'application/octet-stream',
        });
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      console.log('SCHOOL DIARY FILE PICK ERROR =>', error);
      Alert.alert('Error', 'File select nahi ho payi.');
    }
  };

  const handleSubmit = async () => {
    if (!date.trim()) {
      Alert.alert('Required', 'Please select a date');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required', 'Please enter description');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();

      if (!context.BranchId || !context.SessionId) {
        Alert.alert('Error', 'Branch ya session detail nahi mili.');
        return;
      }

      const payload = {
        date,
        description: description.trim(),
        BranchId: context.BranchId,
        SessionId: context.SessionId,
        ...(selectedFile ? {file: selectedFile} : {}),
      };

      console.log('SCHOOL DIARY PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SCHOOL_DIARY_ENTRY, payload);
      console.log('SCHOOL DIARY RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'School diary saved.');
        setDate('');
        setDescription('');
        setSelectedFile(null);
        return;
      }

      Alert.alert('Error', data?.msg || data?.message || 'School diary save nahi ho payi.');
    } catch (error) {
      console.log('SCHOOL DIARY SAVE ERROR =>', error);
      Alert.alert('Error', 'School diary save nahi ho payi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#292246" barStyle="light-content" />

      <SafeAreaView
        style={[
          styles.topSafe,
          Platform.OS === 'android' && {paddingTop: androidTopInset},
        ]}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backCircle}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post School Diary</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>
            Date <Text style={styles.star}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dateBox} onPress={openCalendar}>
            <Text style={[styles.dateText, !date && styles.placeholder]}>
              {date || 'Select Date'}
            </Text>
            <Text style={styles.calIcon}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Description <Text style={styles.star}>*</Text>
          </Text>
          <TextInput
            style={styles.descInput}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
            placeholder="Write about today's activities, homework, or announcements..."
            placeholderTextColor="#aaa"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Upload File</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
            {selectedFile ? (
              <View style={styles.filePreview}>
                {String(selectedFile.type).startsWith('image/') ? (
                  <ImageBackground
                    source={{uri: selectedFile.uri}}
                    style={styles.previewImage}
                    imageStyle={styles.previewImageStyle}
                  />
                ) : (
                  <Text style={styles.fileIcon}>PDF</Text>
                )}
                <Text style={styles.fileName} numberOfLines={2}>
                  {selectedFile.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedFile(null)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.plus}>+</Text>
                <Text style={styles.uploadHint}>Tap to upload doc/image</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>SUBMIT</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={[
                  styles.monthButton,
                  isCurrentMonth && styles.monthButtonDisabled,
                ]}
                disabled={isCurrentMonth}
                onPress={() => changeMonth(-1)}>
                <Text style={styles.monthButtonText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                {calendarMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => changeMonth(1)}>
                <Text style={styles.monthButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map(day => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (!item) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                const disabled = startOfDay(item) < today;
                const selectedDate = parseDate(date);
                const selected =
                  selectedDate &&
                  selectedDate.getTime() === startOfDay(item).getTime();

                return (
                  <TouchableOpacity
                    key={item.toISOString()}
                    style={[
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      disabled && styles.dayCellDisabled,
                    ]}
                    disabled={disabled}
                    onPress={() => selectDate(item)}>
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}>
                      {item.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCalendarVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  topSafe: {
    backgroundColor: '#4B46FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4B46FF',
  },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E2F',
    marginBottom: 10,
    marginTop: 8,
  },
  star: {
    color: '#FF5A5F',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FAFAFE',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#1E1E2F',
    fontWeight: '500',
  },
  placeholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  calIcon: {
    fontSize: 22,
    color: '#4B46FF',
  },
  descInput: {
    height: 140,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
    fontSize: 16,
    color: '#1E1E2F',
    marginBottom: 20,
    backgroundColor: '#FAFAFE',
  },
  uploadBox: {
    width: '100%',
    minHeight: 170,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    backgroundColor: '#F8FAFE',
    overflow: 'hidden',
    padding: 12,
  },
  plus: {
    fontSize: 52,
    color: '#4B46FF',
    fontWeight: '300',
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  filePreview: {
    width: '100%',
    minHeight: 145,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 112,
    marginBottom: 10,
  },
  previewImageStyle: {
    borderRadius: 12,
  },
  fileIcon: {
    width: 76,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#EDEBFF',
    color: '#4B46FF',
    textAlign: 'center',
    lineHeight: 54,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 13,
    color: '#1E1E2F',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 38,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4B46FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B46FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4B46FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  monthButtonText: {
    color: '#fff',
    fontSize: 26,
    lineHeight: 28,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {
    backgroundColor: '#4B46FF',
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayTextDisabled: {
    color: '#999',
  },
  cancelButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
  },
});
