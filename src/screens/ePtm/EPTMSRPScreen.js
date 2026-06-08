import React, {useMemo, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarDays, Check, ChevronDown, Eye} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const TEXT = '#202124';
const BLUE = '#119BE6';

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

const TALK_WITH_OPTIONS = [
  'Mother',
  'Father',
  'Student',
  'Brother',
  'Sister',
  'Guardian',
];
const SATISFACTION_OPTIONS = ['Very good', 'Good', 'Not satisfied'];
const AREA_OPTIONS = ['Teaching', 'Infrastructure', 'Transport', 'Cleanline', 'Other'];

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

const safeGetItems = async keys => {
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return keys.reduce((acc, key, index) => {
    acc[key] = values[index] || '';
    return acc;
  }, {});
};

const getTeacherContext = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const stored = await safeGetItems([
    'EmpCode',
    'BranchId',
    'branchId',
    'branchid',
    'Classid',
    'ClassId',
    'classId',
  ]);

  return {
    EmpCode: parsed?.EmpCode || stored.EmpCode || '',
    BranchId:
      parsed?.BranchId ||
      parsed?.branchId ||
      parsed?.branchid ||
      stored.BranchId ||
      stored.branchId ||
      stored.branchid ||
      '',
    ClassId:
      parsed?.Classid ||
      parsed?.ClassId ||
      parsed?.classId ||
      stored.Classid ||
      stored.ClassId ||
      stored.classId ||
      '',
  };
};

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.response?.Res ||
    data?.response?.res ||
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.Res ||
    data?.rest ||
    data?.data ||
    []
  );
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return status === 'true' || status === 'success';
};

const titleCase = value =>
  String(value || '').replace(/\b\w/g, char => char.toUpperCase());

function RequiredLabel({children, small}) {
  return (
    <Text style={small ? styles.smallInputLabel : styles.inputLabel}>
      {children}
      <Text style={styles.required}> *</Text>
    </Text>
  );
}

function RadioOption({label, selected, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.radioOption}
      onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DropdownField({label, value, placeholder, onPress}) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.selectBox} onPress={onPress}>
      <View style={styles.selectTextWrap}>
        <RequiredLabel>{label}</RequiredLabel>
        <Text style={[styles.selectValue, !value && styles.placeholderText]}>
          {value ? titleCase(value) : placeholder}
        </Text>
      </View>
      <ChevronDown size={19} color={TEXT} strokeWidth={2} />
    </TouchableOpacity>
  );
}

function StudentCard({student}) {
  if (!student) {
    return null;
  }

  const studentName = student.StudentName || student.studentname || '-';
  const enrollNo = student.EnrollNo || student.enrollNo || '-';
  const className = student.ClassName || student.className || '-';
  const sectionName = student.SectionName || student.sectionName || '-';
  const mobile = student.MobileNo || student.mobileNo || '-';
  const studentId = student.StudentId || student.studentId || '-';

  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{studentName}</Text>
        <View style={styles.studentCheck}>
          <Check size={14} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </View>

      <View style={styles.studentGrid}>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Admission No.</Text>
          <Text style={styles.studentValue}>{enrollNo}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Class</Text>
          <Text style={styles.studentValue}>{className}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Section</Text>
          <Text style={styles.studentValue}>{sectionName}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Mobile No.</Text>
          <Text style={styles.studentValue}>{mobile}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Student ID</Text>
          <Text style={styles.studentValue}>{studentId}</Text>
        </View>
      </View>
    </View>
  );
}

export default function EPTMSPRScreen({navigation}) {
  const today = startOfDay(new Date());
  const [mode, setMode] = useState('Online');
  const [date, setDate] = useState(formatDate(today));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [searchText, setSearchText] = useState('');
  const [student, setStudent] = useState(null);
  const [mobileNo, setMobileNo] = useState('');
  const [talkWith, setTalkWith] = useState('');
  const [description, setDescription] = useState('');
  const [parentSatisfaction, setParentSatisfaction] = useState('');
  const [area, setArea] = useState('');
  const [others, setOthers] = useState('');
  const [dropdown, setDropdown] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );

  const openCalendar = () => {
    setCalendarMonth(parseDate(date) || today);
    setCalendarVisible(true);
  };

  const changeMonth = offset => {
    setCalendarMonth(current =>
      startOfDay(new Date(current.getFullYear(), current.getMonth() + offset, 1)),
    );
  };

  const selectDate = nextDate => {
    setDate(formatDate(startOfDay(nextDate)));
    setCalendarVisible(false);
  };

  const handleSearch = async () => {
    const enrollNo = searchText.trim();

    if (!enrollNo) {
      Alert.alert('Required', 'Please enter admission number.');
      return;
    }

    setSearching(true);
    try {
      const context = await getTeacherContext();

      if (!context.EmpCode) {
        Alert.alert('Error', 'EmpCode not found.');
        return;
      }

      const payload = {
        EmpCode: context.EmpCode,
        EnrollNo: enrollNo,
      };

      console.log('E-PTM STUDENT SEARCH PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STUDENT_LIST, payload);
      console.log('E-PTM STUDENT SEARCH RESPONSE =>', data);
      const [nextStudent] = getRows(data);

      if (!nextStudent) {
        setStudent(null);
        Alert.alert('Not Found', 'Student not found.');
        return;
      }

      setStudent(nextStudent);
      setSearchText(nextStudent.EnrollNo || nextStudent.enrollNo || enrollNo);
      setMobileNo(nextStudent.MobileNo || nextStudent.mobileNo || '');
    } catch (error) {
      console.log('E-PTM STUDENT SEARCH ERROR =>', error);
      Alert.alert('Error', 'Student search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      Alert.alert('Required', 'Please select date.');
      return;
    }

    if (!student?.EnrollNo) {
      Alert.alert('Required', 'Please search and select student.');
      return;
    }

    if (!talkWith || !parentSatisfaction || !area) {
      Alert.alert('Required', 'Please select talk with, parent satisfaction and area.');
      return;
    }

    if (area === 'Other' && !others.trim()) {
      Alert.alert('Required', 'Please enter other area.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();

      if (!context.BranchId || !context.EmpCode) {
        Alert.alert('Error', 'Branch or EmpCode not found.');
        return;
      }

      const payload = {
        date,
        Branch_id: context.BranchId,
        EmpCode: context.EmpCode,
        EnrollNo: student.EnrollNo,
        Mobile: mobileNo,
        TalkWith: talkWith,
        description: description.trim(),
        mode,
        psat: parentSatisfaction,
        area: area === 'Other' ? others.trim() : area,
        others: others.trim(),
      };

      console.log('E-PTM SAVE PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SAVE_PTM, payload);
      console.log('E-PTM SAVE RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'E-PTM saved.');
        setStudent(null);
        setSearchText('');
        setMobileNo('');
        setTalkWith('');
        setDescription('');
        setParentSatisfaction('');
        setArea('');
        setOthers('');
        return;
      }

      Alert.alert('Error', data?.msg || data?.message || 'Failed to save E-PTM.');
    } catch (error) {
      console.log('E-PTM SAVE ERROR =>', error);
      Alert.alert('Error', 'Failed to save E-PTM.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPress = async () => {
    setLoadingRecords(true);
    try {
      const data = await postForm(API_ENDPOINTS.SHOW_PTM_ALL, {});
      console.log('E-PTM ALL RECORD RESPONSE =>', data);
      navigation.navigate('EPtmRecordScreen', {records: getRows(data)});
    } catch (error) {
      console.log('E-PTM RECORD ERROR =>', error);
      Alert.alert('Error', 'Failed to load PTM records.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const dropdownOptions =
    dropdown === 'talkWith'
      ? TALK_WITH_OPTIONS
      : dropdown === 'parentSatisfaction'
        ? SATISFACTION_OPTIONS
        : AREA_OPTIONS;

  const onDropdownSelect = value => {
    if (dropdown === 'talkWith') {
      setTalkWith(value);
    } else if (dropdown === 'parentSatisfaction') {
      setParentSatisfaction(value);
    } else {
      setArea(value);
      if (value !== 'Other') {
        setOthers('');
      }
    }

    setDropdown(null);
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="E-PTM SPR"
        onBack={() => navigation.goBack()}
        safeAreaTop
        rightIcon={
          <View style={styles.eyeButton}>
            {loadingRecords ? (
              <ActivityIndicator size="small" color="#FF1493" />
            ) : (
              <Eye size={20} color="#FF1493" strokeWidth={2.2} />
            )}
          </View>
        }
        rightAction={handleRecordPress}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputBox}
            onPress={openCalendar}>
            <View style={styles.inputTextWrap}>
              <RequiredLabel small>Date</RequiredLabel>
              <Text style={styles.inputText}>{date}</Text>
            </View>
            <CalendarDays size={18} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.modeRow}>
            <Text style={styles.modeText}>
              Mode<Text style={styles.required}> *</Text>
            </Text>
            <RadioOption
              label="Online"
              selected={mode === 'Online'}
              onPress={() => setMode('Online')}
            />
            <RadioOption
              label="Offline"
              selected={mode === 'Offline'}
              onPress={() => setMode('Offline')}
            />
          </View>

          <View style={styles.inputBox}>
            <View style={styles.inputTextWrap}>
              <RequiredLabel>Adm No.</RequiredLabel>
              <TextInput
                value={searchText}
                onChangeText={text => {
                  setSearchText(text);
                  setStudent(null);
                }}
                keyboardType="number-pad"
                style={styles.input}
                placeholderTextColor="#777"
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.searchButton, searching && styles.disabledButton]}
            disabled={searching}
            onPress={handleSearch}>
            {searching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>

          <StudentCard student={student} />

          <View style={styles.inputBox}>
            <View style={styles.inputTextWrap}>
              <RequiredLabel>Mobile Number</RequiredLabel>
              <TextInput
                value={mobileNo}
                onChangeText={setMobileNo}
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#777"
              />
            </View>
          </View>

          <DropdownField
            label="Talk With"
            value={talkWith}
            placeholder="Select"
            onPress={() => setDropdown('talkWith')}
          />

          <View style={styles.descriptionBox}>
            <RequiredLabel small>Description</RequiredLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
              placeholderTextColor="#777"
            />
          </View>

          <DropdownField
            label="Parent Satisfaction"
            value={parentSatisfaction}
            placeholder="Select"
            onPress={() => setDropdown('parentSatisfaction')}
          />

          <DropdownField
            label="Area"
            value={area}
            placeholder="Select"
            onPress={() => setDropdown('area')}
          />

          {area === 'Other' ? (
            <View style={styles.inputBox}>
              <View style={styles.inputTextWrap}>
                <RequiredLabel>Other</RequiredLabel>
                <TextInput
                  value={others}
                  onChangeText={setOthers}
                  style={styles.input}
                  placeholderTextColor="#777"
                />
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, submitting && styles.disabledButton]}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={Boolean(dropdown)} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setDropdown(null)}>
          <View style={styles.optionSheet}>
            {dropdownOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={styles.optionRow}
                onPress={() => onDropdownSelect(option)}>
                <Text style={styles.optionText}>{titleCase(option)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => changeMonth(-1)}>
                <Text style={styles.monthButtonText}>{'<'}</Text>
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                {calendarMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => changeMonth(1)}>
                <Text style={styles.monthButtonText}>{'>'}</Text>
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

                const selectedDate = parseDate(date);
                const selected =
                  selectedDate &&
                  selectedDate.getTime() === startOfDay(item).getTime();

                return (
                  <TouchableOpacity
                    key={item.toISOString()}
                    style={[styles.dayCell, selected && styles.dayCellSelected]}
                    onPress={() => selectDate(item)}>
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
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
    backgroundColor: '#FFFFFF',
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 42,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 17,
  },
  inputTextWrap: {
    flex: 1,
  },
  inputLabel: {
    color: TEXT,
    fontSize: 14,
  },
  smallInputLabel: {
    color: '#6D7179',
    fontSize: 11,
  },
  required: {
    color: '#FF0808',
  },
  input: {
    color: TEXT,
    fontSize: 14,
    padding: 0,
  },
  inputText: {
    color: TEXT,
    fontSize: 14,
    marginTop: 2,
  },
  placeholderText: {
    color: '#777',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  modeText: {
    color: TEXT,
    fontSize: 14,
    marginRight: 18,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  radioOuter: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1,
    borderColor: '#C9C9C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  radioOuterActive: {
    borderColor: PURPLE,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: PURPLE,
  },
  radioLabel: {
    color: TEXT,
    fontSize: 14,
  },
  searchButton: {
    height: 45,
    borderRadius: 6,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
  studentCard: {
    borderWidth: 1,
    borderColor: '#BDE6FA',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 21,
    overflow: 'hidden',
  },
  studentHeader: {
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#D4E7F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  studentName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  studentCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 2,
  },
  studentCell: {
    width: '50%',
    marginBottom: 14,
  },
  studentLabel: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 5,
  },
  studentValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  selectBox: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginBottom: 15,
  },
  selectTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  selectValue: {
    color: TEXT,
    fontSize: 14,
    marginTop: 2,
  },
  descriptionBox: {
    height: 94,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    paddingHorizontal: 15,
    paddingTop: 8,
    marginBottom: 16,
  },
  descriptionInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    padding: 0,
  },
  submitButton: {
    height: 46,
    borderRadius: 6,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  optionSheet: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  optionRow: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  optionText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '600',
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: BLUE,
    fontSize: 20,
    fontWeight: '700',
  },
  calendarTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekText: {
    width: `${100 / 7}%`,
    color: '#6D7179',
    fontSize: 12,
    textAlign: 'center',
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
    borderRadius: 6,
  },
  dayCellSelected: {
    backgroundColor: BLUE,
  },
  dayText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 42,
    borderRadius: 6,
    backgroundColor: '#F1F1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
});
