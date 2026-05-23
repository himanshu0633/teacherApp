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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarDays, ChevronDown, CircleCheck, Plus} from 'lucide-react-native';
import {CircularHeader, CircularTabs} from './CircularComponents';
import {TEXT, circularStyles as baseStyles} from './circularStyles';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

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

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response?.data ||
    data?.rest ||
    data?.Res ||
    data?.data ||
    []
  );
};

const success = data =>
  data?.status === true || String(data?.status || '').toLowerCase() === 'true';

const getTeacherContext = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const [empCode, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);

  return {
    EmpCode: parsed?.EmpCode || empCode || '',
    BranchId: parsed?.BranchId || parsed?.branchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const normalizeStudentType = item => ({
  id: String(item?.StudentTypeID || item?.id || ''),
  name: String(item?.StudentTypeName || item?.name || ''),
});

const normalizeClass = item => ({
  id: String(item?.class_id || item?.ClassId || item?.id || ''),
  name: String(item?.class_name || item?.ClassName || item?.name || ''),
  sectionId: String(item?.section_id || item?.SectionId || ''),
});

const normalizeStudent = item => ({
  id: String(item?.Admission_no || item?.EnrollNo || item?.id || ''),
  admissionNo: String(item?.Admission_no || item?.EnrollNo || ''),
  name: String(item?.StudentName || item?.name || 'Student'),
  fatherName: String(item?.FatherName || ''),
  mobileNo: String(item?.MobileNo || ''),
  classId: String(item?.ClassId || ''),
  className: String(item?.ClassName || ''),
  sectionName: String(item?.SectionName || ''),
  sectionId: String(item?.SectionId || ''),
});

function RequiredText({children}) {
  return (
    <Text>
      {children}
      <Text style={baseStyles.required}>*</Text>
    </Text>
  );
}

function SelectField({placeholder, value, onPress, disabled, loading}) {
  return (
    <TouchableOpacity
      style={[baseStyles.field, disabled && baseStyles.disabledButton]}
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}>
      <Text style={[baseStyles.fieldText, !value && baseStyles.disabledText]}>
        {value || <RequiredText>{placeholder}</RequiredText>}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color="#05A9F4" />
      ) : (
        <ChevronDown size={19} color={TEXT} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

function StudentCard({student, selected, onPress}) {
  return (
    <TouchableOpacity
      style={[styles.studentCard, selected && styles.selectedStudentCard]}
      activeOpacity={0.82}
      onPress={onPress}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{student.name}</Text>
        <CircleCheck
          size={20}
          color={selected ? '#22B63A' : '#CFEAF8'}
          strokeWidth={2}
        />
      </View>

      <View style={styles.studentGrid}>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Admission No.</Text>
          <Text style={styles.studentValue}>{student.admissionNo || '-'}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Class</Text>
          <Text style={styles.studentValue}>{student.className || '-'}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Section</Text>
          <Text style={styles.studentValue}>{student.sectionName || '-'}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Mobile No.</Text>
          <Text style={styles.studentValue}>{student.mobileNo || '-'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function StudentCircularScreen({navigation}) {
  const today = startOfDay(new Date());
  const [context, setContext] = useState({});
  const [date, setDate] = useState(formatDate(today));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentTypes, setStudentTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [activePicker, setActivePicker] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );

  useEffect(() => {
    getTeacherContext().then(setContext);
  }, []);

  useEffect(() => {
    const loadStudentTypes = async () => {
      setLoadingTypes(true);
      try {
        const data = await postForm(API_ENDPOINTS.STUDENT_TYPE, {});
        const rows = getRows(data).map(normalizeStudentType).filter(item => item.id);
        setStudentTypes(rows);
      } catch (error) {
        console.log('STUDENT TYPE ERROR =>', error);
        Alert.alert('Error', 'Failed to load student types.');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadStudentTypes();
  }, []);

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

  const loadClasses = async type => {
    if (!context.BranchId) {
      Alert.alert('Error', 'Branch details not found.');
      return;
    }

    setLoadingClasses(true);
    try {
      const payload = {
        StudentTypeID: type.id,
        branch_id: context.BranchId,
      };
      console.log('STUDENT CIRCULAR CLASS PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STUDENT_CIRCULAR_CLASSES, payload);
      const rows = getRows(data).map(normalizeClass).filter(item => item.id);
      setClasses(rows);
    } catch (error) {
      console.log('STUDENT CIRCULAR CLASS ERROR =>', error);
      Alert.alert('Error', 'Failed to load classes.');
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStudents = async classItem => {
    if (!context.BranchId || !context.SessionId || !selectedType?.id) {
      Alert.alert('Error', 'Branch, session or student type not found.');
      return;
    }

    setLoadingStudents(true);
    try {
      const payload = {
        branch_id: context.BranchId,
        session_id: context.SessionId,
        student_type_id: selectedType.id,
        class_id: classItem.id,
      };
      console.log('STUDENT CIRCULAR STUDENT LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STUDENT_LIST_FOR_CIRCULAR, payload);
      const rows = getRows(data).map(normalizeStudent).filter(item => item.id);
      setStudents(rows);
      setSelectedStudents(rows.map(item => item.id));
    } catch (error) {
      console.log('STUDENT CIRCULAR STUDENT LIST ERROR =>', error);
      Alert.alert('Error', 'Failed to load students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleTypeSelect = type => {
    setSelectedType(type);
    setSelectedClass(null);
    setClasses([]);
    setStudents([]);
    setSelectedStudents([]);
    setActivePicker(null);
    loadClasses(type);
  };

  const handleClassSelect = classItem => {
    setSelectedClass(classItem);
    setStudents([]);
    setSelectedStudents([]);
    setActivePicker(null);
    loadStudents(classItem);
  };

  const toggleStudent = studentId => {
    setSelectedStudents(current =>
      current.includes(studentId)
        ? current.filter(id => id !== studentId)
        : [...current, studentId],
    );
  };

  const handleSubmit = async () => {
    if (!date || !title.trim() || !description.trim()) {
      Alert.alert('Required', 'Please enter date, title and message.');
      return;
    }

    if (!selectedType || !selectedClass) {
      Alert.alert('Required', 'Please select student type and class.');
      return;
    }

    const selectedRows = students.filter(item => selectedStudents.includes(item.id));

    if (!selectedRows.length) {
      Alert.alert('Required', 'Please select at least one student.');
      return;
    }

    if (!context.BranchId || !context.SessionId || !context.EmpCode) {
      Alert.alert('Error', 'Branch, session or EmpCode not found.');
      return;
    }

    setSubmitting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const student of selectedRows) {
        const payload = {
          branch_id: context.BranchId,
          session_id: context.SessionId,
          enroll_no: student.admissionNo,
          class_id: student.classId || selectedClass.id,
          section_id: student.sectionId || selectedClass.sectionId,
          circular_date: date,
          EmpCode: context.EmpCode,
          title: title.trim(),
          description: description.trim(),
          student_type_id: selectedType.id,
          group_type: '',
        };

        console.log('STUDENT CIRCULAR SAVE PAYLOAD =>', payload);
        const data = await postForm(API_ENDPOINTS.STUDENT_CIRCULAR, payload);

        if (success(data)) {
          successCount += 1;
        } else {
          failCount += 1;
        }
      }

      if (successCount && !failCount) {
        Alert.alert('Success', 'Circular sucessfully assign to students..');
        setTitle('');
        setDescription('');
        setSelectedStudents([]);
      } else if (successCount) {
        Alert.alert('Partial', `${successCount} saved, ${failCount} failed.`);
      } else {
        Alert.alert('Error', 'Student circular save failed.');
      }
    } catch (error) {
      console.log('STUDENT CIRCULAR SAVE ERROR =>', error);
      Alert.alert('Error', 'Student circular save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickerItems = activePicker === 'type' ? studentTypes : classes;
  const pickerTitle = activePicker === 'type' ? 'Student Type' : 'Class';

  return (
    <View style={baseStyles.wrapper}>
      <CircularHeader
        title="Student Circular"
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={baseStyles.page}>
        <CircularTabs
          active="create"
          onCreate={() => {}}
          onList={() =>
            navigation.navigate('MyCircularListScreen', {
              circularType: 'student',
            })
          }
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={[baseStyles.field, styles.dateField]}
            activeOpacity={0.75}
            onPress={openCalendar}>
            <View style={styles.dateTextWrap}>
              <Text style={styles.dateLabel}>
                Date <Text style={baseStyles.required}>*</Text>
              </Text>
              <Text style={styles.dateValue}>{date}</Text>
            </View>
            <CalendarDays size={18} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <TextInput
            style={baseStyles.field}
            placeholder="Circular Title *"
            placeholderTextColor={TEXT}
            value={title}
            onChangeText={setTitle}
          />

          <SelectField
            placeholder="Student Type "
            value={selectedType?.name}
            loading={loadingTypes}
            disabled={loadingTypes}
            onPress={() => setActivePicker('type')}
          />
          <SelectField
            placeholder="Select Class "
            value={selectedClass?.name}
            loading={loadingClasses}
            disabled={!selectedType || loadingClasses}
            onPress={() => setActivePicker('class')}
          />

          {loadingStudents ? (
            <View style={baseStyles.centeredState}>
              <ActivityIndicator color="#05A9F4" />
            </View>
          ) : students.length ? (
            students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                selected={selectedStudents.includes(student.id)}
                onPress={() => toggleStudent(student.id)}
              />
            ))
          ) : (
            <View style={baseStyles.centeredState}>
              <Text style={baseStyles.stateText}>
                Students will appear after class selection.
              </Text>
            </View>
          )}

          <TextInput
            style={styles.messageBox}
            placeholder="Message *"
            placeholderTextColor={TEXT}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <View style={baseStyles.uploadField}>
            <Text style={baseStyles.uploadText}>Upload File</Text>
            <TouchableOpacity style={baseStyles.uploadButton} activeOpacity={0.75}>
              <Plus size={42} color="#FF0712" strokeWidth={1.9} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              baseStyles.submitButton,
              submitting && baseStyles.disabledButton,
            ]}
            disabled={submitting}
            onPress={handleSubmit}
            activeOpacity={0.82}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={baseStyles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={Boolean(activePicker)}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePicker(null)}>
        <TouchableOpacity
          activeOpacity={1}
          style={baseStyles.modalBackdrop}
          onPress={() => setActivePicker(null)}>
          <View style={baseStyles.modalSheet}>
            <Text style={baseStyles.modalTitle}>{pickerTitle}</Text>
            <ScrollView>
              {pickerItems.map(item => (
                <TouchableOpacity
                  key={`${item.id}-${item.sectionId || ''}`}
                  style={baseStyles.modalOption}
                  onPress={() =>
                    activePicker === 'type'
                      ? handleTypeSelect(item)
                      : handleClassSelect(item)
                  }>
                  <Text style={baseStyles.modalOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.calendarBackdrop}>
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
  content: {
    paddingHorizontal: 28,
    paddingTop: 17,
    paddingBottom: 44,
  },
  dateField: {
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  dateTextWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dateLabel: {
    color: '#6F737B',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'left',
  },
  dateValue: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'left',
  },
  studentCard: {
    borderWidth: 1,
    borderColor: '#BDE6FA',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 15,
    overflow: 'hidden',
  },
  selectedStudentCard: {
    borderColor: '#22B63A',
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
  messageBox: {
    minHeight: 98,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    color: TEXT,
    fontSize: 14,
    paddingHorizontal: 15,
    paddingTop: 14,
    marginTop: 2,
    marginBottom: 18,
  },
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    color: '#05A9F4',
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
    backgroundColor: '#05A9F4',
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
