import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import CommonHeader from '../../components/CommonHeader';
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
  return day && month && year ? startOfDay(new Date(year, month - 1, day)) : null;
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
  const [saved, branchId, sessionId, session, empCode] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
    AsyncStorage.getItem('EmpCode'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
  };
};

const getFirstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const getListFromResponse = response => {
  if (Array.isArray(response)) {
    return response;
  }

  const wrapper = response?.response || response;

  return (
    wrapper?.Res ||
    wrapper?.Rest ||
    wrapper?.rest ||
    wrapper?.data ||
    wrapper?.list ||
    []
  );
};

const normalizeClass = item => ({
  id: getFirstValue(item, ['Classid', 'ClassId', 'classid', 'classId', 'id']),
  label: getFirstValue(item, ['ClassName', 'Class', 'classname', 'className', 'name']),
});

const success = data => {
  const status = String(data?.status || '').toLowerCase();
  return status === 'true' || status === 'success';
};

export default function CreateClassGalleryCategoryScreen({navigation}) {
  const today = startOfDay(new Date());
  const [teacher, setTeacher] = useState(null);
  const [date, setDate] = useState(formatDate(today));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classPickerVisible, setClassPickerVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const context = await getTeacherContext();
        setTeacher(context);

        const data = await postForm(API_ENDPOINTS.FILL_CLASS, {
          BranchId: context.BranchId,
          SessionId: context.SessionId,
          EmpCode: context.EmpCode,
        });

        console.log('CLASS GALLERY CATEGORY CLASS RESPONSE =>', data);
        setClasses(
          getListFromResponse(data)
            .map(normalizeClass)
            .filter(item => item.id && item.label),
        );
      } catch (error) {
        console.log('CLASS GALLERY CATEGORY CLASS ERROR =>', error);
        Alert.alert('Error', 'Class list could not be loaded.');
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  const openCalendar = () => {
    setCalendarMonth(parseDate(date) || today);
    setCalendarVisible(true);
  };

  const changeMonth = offset => {
    setCalendarMonth(current => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);

      if (
        next.getFullYear() < today.getFullYear() ||
        (next.getFullYear() === today.getFullYear() &&
          next.getMonth() < today.getMonth())
      ) {
        return current;
      }

      return startOfDay(next);
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

  const pickImage = async () => {
    try {
      const [file] = await pick({type: [types.images]});

      if (file) {
        setSelectedFile({
          uri: file.uri,
          name: file.name || 'category-image',
          type: file.type || 'image/jpeg',
        });
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      console.log('CLASS GALLERY CATEGORY IMAGE PICK ERROR =>', error);
      Alert.alert('Error', 'Image could not be selected.');
    }
  };

  const submit = async () => {
    if (!date || !selectedClass || !categoryName.trim() || !selectedFile) {
      Alert.alert('Required', 'Please select date, class, category name, and image.');
      return;
    }

    setSubmitting(true);
    try {
      const context = teacher || (await getTeacherContext());
      const payload = {
        classId: selectedClass.id,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        name: categoryName.trim(),
        EmpCode: context.EmpCode,
        pic: selectedFile,
        date,
      };

      console.log('CLASS GALLERY CATEGORY SAVE PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.INSERT_CLASS_GALLERY_CATEGORY, payload);
      console.log('CLASS GALLERY CATEGORY SAVE RESPONSE =>', data);

      if (success(data)) {
        Alert.alert('Success', data?.message || data?.msg || 'Category saved.');
        setCategoryName('');
        setSelectedFile(null);
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Category could not be saved.');
    } catch (error) {
      console.log('CLASS GALLERY CATEGORY SAVE ERROR =>', error);
      Alert.alert('Error', 'Category could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Create Class Gallery Category"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.inputBox} onPress={openCalendar}>
            <Text style={styles.smallLabel}>
              Date <Text style={styles.star}>*</Text>
            </Text>
            <Text style={styles.inputText}>{date}</Text>
          </TouchableOpacity>

          <SelectBox
            label="Select Class"
            value={selectedClass?.label}
            onPress={() => setClassPickerVisible(true)}
          />

          <InputBox
            label="Category Name"
            required
            value={categoryName}
            onChangeText={setCategoryName}
          />

          <UploadBox label="Category Image" file={selectedFile} onPress={pickImage} />

          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.disabledBtn]}
              disabled={submitting}
              onPress={submit}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => navigation.navigate('ViewClassGalleryCategoryScreen')}>
              <Text style={styles.viewText}>⊙  View Class Gallery Categories</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <PickerModal
        visible={classPickerVisible}
        title="Select Class"
        items={classes}
        loading={loadingClasses}
        onClose={() => setClassPickerVisible(false)}
        onSelect={item => {
          setSelectedClass(item);
          setClassPickerVisible(false);
        }}
      />

      <CalendarModal
        visible={calendarVisible}
        calendarMonth={calendarMonth}
        calendarDays={calendarDays}
        today={today}
        selectedDate={parseDate(date)}
        isCurrentMonth={isCurrentMonth}
        onClose={() => setCalendarVisible(false)}
        onChangeMonth={changeMonth}
        onSelectDate={selectDate}
      />
    </View>
  );
}

function InputBox({label, value, onChangeText, required}) {
  return (
    <View style={styles.inputBox}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={`${label}${required ? ' *' : ''}`}
        placeholderTextColor="#222"
        style={styles.input}
      />
    </View>
  );
}

function SelectBox({label, value, onPress}) {
  return (
    <TouchableOpacity style={styles.selectBox} onPress={onPress}>
      <View>
        {value ? (
          <>
            <Text style={styles.smallLabel}>
              {label} <Text style={styles.star}>*</Text>
            </Text>
            <Text style={styles.selectText}>{value}</Text>
          </>
        ) : (
          <Text style={styles.selectText}>
            {label} <Text style={styles.star}>*</Text>
          </Text>
        )}
      </View>
      <Text style={styles.down}>⌄</Text>
    </TouchableOpacity>
  );
}

function UploadBox({label, file, onPress}) {
  return (
    <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
      <Text style={styles.uploadText} numberOfLines={2}>
        {file?.name || label}
      </Text>
      <View style={styles.plusBox}>
        <Text style={styles.plus}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

function PickerModal({visible, title, items, loading, onClose, onSelect}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {loading ? (
            <ActivityIndicator color="#5A33C5" />
          ) : items.length ? (
            <ScrollView>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyModalText}>List is empty.</Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CalendarModal({
  visible,
  calendarMonth,
  calendarDays,
  today,
  selectedDate,
  isCurrentMonth,
  onClose,
  onChangeMonth,
  onSelectDate,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={[
                styles.monthButton,
                isCurrentMonth && styles.monthButtonDisabled,
              ]}
              disabled={isCurrentMonth}
              onPress={() => onChangeMonth(-1)}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>
              {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => onChangeMonth(1)}>
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
                  onPress={() => onSelectDate(item)}>
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

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {flexGrow: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 34},
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  smallLabel: {fontSize: 9, color: '#777'},
  star: {color: 'red'},
  input: {padding: 0, fontSize: 14, color: '#222'},
  inputText: {fontSize: 14, color: '#222'},
  selectBox: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {fontSize: 14, color: '#222'},
  down: {fontSize: 22, color: '#222', marginTop: -5},
  uploadBox: {
    height: 77,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {flex: 1, fontSize: 14, color: '#222', paddingRight: 12},
  plusBox: {
    width: 60,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {fontSize: 42, color: 'red', lineHeight: 42},
  bottom: {marginTop: 'auto'},
  submitBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledBtn: {opacity: 0.65},
  submitText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  viewBtn: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#0098EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  viewText: {color: '#0098EE', fontSize: 16, fontWeight: '800'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 15,
    color: '#222',
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  modalItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  modalItemText: {fontSize: 14, color: '#222'},
  emptyModalText: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 13,
    color: '#777',
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
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {backgroundColor: '#CFCFCF'},
  monthButtonText: {color: '#fff', fontSize: 26, lineHeight: 28},
  weekRow: {flexDirection: 'row', marginBottom: 8},
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {backgroundColor: '#5A33C5'},
  dayCellDisabled: {opacity: 0.35},
  dayText: {color: '#222', fontSize: 15, fontWeight: '600'},
  dayTextSelected: {color: '#fff'},
  dayTextDisabled: {color: '#999'},
  cancelButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {color: '#333', fontSize: 15, fontWeight: '700'},
});
