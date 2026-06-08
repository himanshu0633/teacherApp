import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import CommonHeader from '../../components/CommonHeader';
import { API_ENDPOINTS, BASE_URL } from '../../utils/constants';

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

const today = startOfDay(new Date());

const formatDisplayDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatHomeworkApiDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}/${month}/${day}`;
};

const formatAssignmentApiDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

const buildCalendarDays = monthDate => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month, index + 1),
  );

  return [...blanks, ...days];
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

const postForm = async (endpoint, fields) => {
  const formData = new FormData();
  const hasFile = Object.values(fields).some(value => value?.uri);

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: hasFile
      ? undefined
      : {
          'Content-Type': 'multipart/form-data',
        },
    body: formData,
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(`${endpoint} JSON PARSE ERROR =>`, error);
    console.log(`${endpoint} RAW RESPONSE =>`, text);
    return null;
  }
};

const normalizeClass = item => ({
  id: getFirstValue(item, ['Classid', 'ClassId', 'classid', 'id']),
  name: getFirstValue(item, ['ClassName', 'Class', 'classname', 'name']),
});

const normalizeSection = item => ({
  id: getFirstValue(item, ['SectionId', 'SectionID', 'sectionid', 'id']),
  name: getFirstValue(item, ['SectionName', 'Section', 'section', 'name']),
});

const normalizeSubject = item => ({
  id: getFirstValue(item, ['SubjectId', 'SubjectID', 'subjectid', 'id']),
  name: getFirstValue(item, ['SubjectName', 'Subject', 'subject', 'name']),
});

async function loadTeacherContext() {
  const raw = await AsyncStorage.getItem('teacherData');
  const parsed = raw ? JSON.parse(raw) : {};
  const [empCode, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);

  return {
    ...parsed,
    EmpCode: parsed?.EmpCode || empCode || '',
    BranchId: parsed?.BranchId || branchId || '',
    SessionId:
      parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
}

function PickerModal({
  title,
  visible,
  items,
  loading,
  emptyText,
  onClose,
  onSelect,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#5A33C5" style={styles.modalLoader} />
          ) : items.length ? (
            <ScrollView style={styles.pickerList}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.pickerOption}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.pickerOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyModalText}>{emptyText}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function HomeworkAssignmentScreen({ navigation }) {
  const [tab, setTab] = useState('homework');
  const [teacher, setTeacher] = useState({});
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dueDate, setDueDate] = useState(today);
  const [description, setDescription] = useState('');
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isHomework = tab === 'homework';
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  const loadClasses = useCallback(async teacherContext => {
    if (
      !teacherContext?.EmpCode ||
      !teacherContext?.BranchId ||
      !teacherContext?.SessionId
    ) {
      return;
    }

    try {
      setLoadingClasses(true);
      const data = await postForm(API_ENDPOINTS.FILL_CLASS, {
        BranchId: teacherContext.BranchId,
        SessionId: teacherContext.SessionId,
        EmpCode: teacherContext.EmpCode,
      });
      const classList = getListFromResponse(data)
        .map(normalizeClass)
        .filter(item => item.id && item.name);

      setClasses(classList);
    } catch (error) {
      console.log('fillclass.php CALL ERROR =>', error);
  Alert.alert('Error', 'Failed to load class list.');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadSections = useCallback(
    async classItem => {
      if (!classItem?.id || !teacher?.EmpCode) {
        return;
      }

      try {
        setLoadingSections(true);
        const data = await postForm(API_ENDPOINTS.SHOW_SECTION, {
          EmpCode: teacher.EmpCode,
          BranchId: teacher.BranchId,
          ClassId: classItem.id,
          SessionId: teacher.SessionId,
        });
        const sectionList = getListFromResponse(data)
          .map(normalizeSection)
          .filter(item => item.id && item.name);

        setSections(sectionList);
      } catch (error) {
        console.log('show_section.php CALL ERROR =>', error);
  Alert.alert('Error', 'Failed to load section list.');
      } finally {
        setLoadingSections(false);
      }
    },
    [teacher],
  );

  const loadSubjects = useCallback(
    async sectionItem => {
      if (!selectedClass?.id || !sectionItem?.id || !teacher?.EmpCode) {
        return;
      }

      try {
        setLoadingSubjects(true);
        const data = await postForm(API_ENDPOINTS.SUBJECT, {
          EmpCode: teacher.EmpCode,
          SectionId: sectionItem.id,
          ClassId: selectedClass.id,
          BranchId: teacher.BranchId,
          SessionId: teacher.SessionId,
        });
        const subjectList = getListFromResponse(data)
          .map(normalizeSubject)
          .filter(item => item.id && item.name);

        setSubjects(subjectList);
      } catch (error) {
        console.log('subject.php CALL ERROR =>', error);
  Alert.alert('Error', 'Failed to load subject list.');
      } finally {
        setLoadingSubjects(false);
      }
    },
    [selectedClass, teacher],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const teacherContext = await loadTeacherContext();
        setTeacher(teacherContext);
        await loadClasses(teacherContext);
      } catch (error) {
        console.log('HOMEWORK INIT ERROR =>', error);
      }
    };

    init();
  }, [loadClasses]);

  const changeMonth = direction => {
    setCalendarMonth(current => {
      const nextMonth = new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1,
      );

      if (
        startOfDay(
          new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0),
        ) < today
      ) {
        return current;
      }

      return nextMonth;
    });
  };

  const selectClass = classItem => {
    setSelectedClass(classItem);
    setSelectedSection(null);
    setSelectedSubject(null);
    setSections([]);
    setSubjects([]);
    setClassModalVisible(false);
    loadSections(classItem);
  };

  const selectSection = sectionItem => {
    setSelectedSection(sectionItem);
    setSelectedSubject(null);
    setSubjects([]);
    setSectionModalVisible(false);
    loadSubjects(sectionItem);
  };

  const pickAssignmentFile = async () => {
    try {
      const [file] = await pick({
        type: [
          types.images,
          types.pdf,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
          types.plainText,
        ],
        allowMultiSelection: false,
      });

      if (!file?.uri) {
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || 'assignment-file',
        type: file.type || 'application/octet-stream',
      });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      console.log('ASSIGNMENT FILE PICK ERROR =>', error);
  Alert.alert('Error', 'File selection failed.');
    }
  };

  const submitHomework = async () => {
    if (!selectedClass?.id) {
  Alert.alert('Required', 'Please select a class.');
      return;
    }

    if (!selectedSection?.id) {
  Alert.alert('Required', 'Please select a section.');
      return;
    }

    if (!selectedSubject?.id) {
  Alert.alert('Required', 'Please select a subject.');
      return;
    }

    if (!description.trim()) {
  Alert.alert('Required', 'Please enter a description.');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = isHomework
        ? API_ENDPOINTS.ASSIGN_HOMEWORK
        : API_ENDPOINTS.ASSIGNMENT;
      const payload = {
        EmpCode: teacher.EmpCode,
        ClassId: selectedClass.id,
        SectionId: selectedSection.id,
        SubjectId: selectedSubject.id,
        Description: description.trim(),
        DueDate: isHomework
          ? formatHomeworkApiDate(dueDate)
          : formatAssignmentApiDate(dueDate),
        BranchId: teacher.BranchId,
      };

      if (!isHomework && selectedFile) {
        payload.Attachment = selectedFile;
      }

      const data = await postForm(endpoint, payload);

      if (!data || data?.status === false || data?.status === 'false') {
        Alert.alert(
          'Error',
          data?.message ||
            data?.msg ||
            `${isHomework ? 'Homework' : 'Assignment'} failed to send.`,
        );
        return;
      }

      Alert.alert(
        'Success',
        data?.message ||
          data?.msg ||
          `${isHomework ? 'Homework' : 'Assignment'} sent.`,
      );
      setDescription('');
      setSelectedFile(null);
    } catch (error) {
      console.log(
        `${isHomework ? 'AssignHomework.php' : 'assignment.php'} CALL ERROR =>`,
        error,
      );
      Alert.alert(
        'Error',
  `${isHomework ? 'Homework' : 'Assignment'} failed to send.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Homework / Assignment"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabBtn, isHomework && styles.activeTab]}
                onPress={() => setTab('homework')}
              >
                <Text style={[styles.tabIcon, isHomework && styles.activeText]}>
                  HW
                </Text>
                <Text style={[styles.tabText, isHomework && styles.activeText]}>
                  Home Work
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, !isHomework && styles.activeTab]}
                onPress={() => setTab('assignment')}
              >
                <Text
                  style={[styles.tabIcon, !isHomework && styles.activeText]}
                >
                  AS
                </Text>
                <Text
                  style={[styles.tabText, !isHomework && styles.activeText]}
                >
                  Assignment
                </Text>
              </TouchableOpacity>
            </View>

            <SelectBox
              label="Class"
              value={selectedClass?.name}
              onPress={() => setClassModalVisible(true)}
            />
            <SelectBox
              label="Section"
              value={selectedSection?.name}
              onPress={() => {
                if (!selectedClass?.id) {
                  Alert.alert('Required', 'Please select the class first.');
                  return;
                }

                setSectionModalVisible(true);
              }}
            />
            <SelectBox
              label="Subject"
              value={selectedSubject?.name}
              onPress={() => {
                if (!selectedSection?.id) {
                  Alert.alert('Required', 'Please select the section first.');
                  return;
                }

                setSubjectModalVisible(true);
              }}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.inputBox}
              onPress={() => {
                setCalendarMonth(
                  new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
                );
                setCalendarVisible(true);
              }}
            >
              <Text style={styles.smallLabel}>
                Due Date <Text style={styles.star}>*</Text>
              </Text>
              <Text style={styles.inputText}>{formatDisplayDate(dueDate)}</Text>
            </TouchableOpacity>

            <View style={styles.descriptionBox}>
              <Text style={styles.smallLabel}>
                Description <Text style={styles.star}>*</Text>
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="write here..."
                placeholderTextColor="#888"
                multiline
                style={styles.descriptionInput}
              />
            </View>

            {!isHomework && (
              <View style={styles.uploadBox}>
                <TouchableOpacity
                  style={styles.uploadPressArea}
                  onPress={pickAssignmentFile}
                >
                  <View style={styles.uploadTextWrap}>
                    <Text style={styles.uploadText}>
                      {selectedFile ? 'Selected file' : 'Upload doc/image'}
                    </Text>
                    {selectedFile ? (
                      <Text numberOfLines={1} style={styles.fileNameText}>
                        {selectedFile.name}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.plusBox}>
                    <Text style={styles.plus}>+</Text>
                  </View>
                </TouchableOpacity>

                {selectedFile ? (
                  <TouchableOpacity
                    style={styles.removeFileButton}
                    onPress={() => setSelectedFile(null)}
                  >
                    <Text style={styles.removeFileText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              style={[styles.sendBtn, submitting && styles.disabledButton]}
              disabled={submitting}
              onPress={submitHomework}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendText}>
                  {isHomework ? 'Send Homework' : 'Send Assignment'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() =>
                navigation.navigate('AssignmentHistoryScreen', {
                  type: isHomework ? 'homework' : 'assignment',
                })
              }
            >
              <Text style={styles.historyText}>
                View {isHomework ? 'Homework' : 'Assignment'} History
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

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
                onPress={() => changeMonth(-1)}
              >
                <Text style={styles.monthButtonText}>{'<'}</Text>
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                {calendarMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => changeMonth(1)}
              >
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
              {calendarDays.map((date, index) => {
                if (!date || startOfDay(date) < today) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                const isSelected =
                  startOfDay(date).getTime() === dueDate.getTime();

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => {
                      setDueDate(startOfDay(date));
                      setCalendarVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PickerModal
        title="Select Class"
        visible={classModalVisible}
        items={classes}
        loading={loadingClasses}
        emptyText="No classes found."
        onClose={() => setClassModalVisible(false)}
        onSelect={selectClass}
      />

      <PickerModal
        title="Select Section"
        visible={sectionModalVisible}
        items={sections}
        loading={loadingSections}
        emptyText="No sections found."
        onClose={() => setSectionModalVisible(false)}
        onSelect={selectSection}
      />

      <PickerModal
        title="Select Subject"
        visible={subjectModalVisible}
        items={subjects}
        loading={loadingSubjects}
        emptyText="No subjects found."
        onClose={() => setSubjectModalVisible(false)}
        onSelect={item => {
          setSelectedSubject(item);
          setSubjectModalVisible(false);
        }}
      />
    </View>
  );
}

function SelectBox({ label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.selectBox} onPress={onPress}>
      <Text
        numberOfLines={1}
        style={[styles.selectText, !value && styles.placeholderText]}
      >
        {value || label} <Text style={styles.star}>*</Text>
      </Text>
      <Text style={styles.arrow}>v</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#5A33C5',
  },
  topSafe: {
    backgroundColor: '#5A33C5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 30,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 6,
  },
  tabBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0B9BEF',
    borderColor: '#0B9BEF',
  },
  tabIcon: {
    fontSize: 13,
    marginRight: 8,
    fontWeight: '800',
    color: '#222',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  activeText: {
    color: '#fff',
  },
  selectBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
  placeholderText: {
    color: '#777',
  },
  star: {
    color: 'red',
  },
  arrow: {
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  inputBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 16,
  },
  smallLabel: {
    fontSize: 9,
    color: '#888',
  },
  inputText: {
    marginTop: 2,
    fontSize: 14,
    color: '#222',
  },
  descriptionBox: {
    minHeight: 94,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 9,
    marginBottom: 18,
  },
  descriptionInput: {
    minHeight: 62,
    padding: 0,
    marginTop: 2,
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
  },
  uploadPressArea: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  uploadText: {
    fontSize: 14,
    color: '#222',
  },
  fileNameText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
  },
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
  plus: {
    fontSize: 42,
    color: 'red',
    lineHeight: 42,
  },
  removeFileButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  removeFileText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
  },
  sendBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  disabledButton: {
    opacity: 0.75,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  historyBtn: {
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  historyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerTitle: {
    color: '#222',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '700',
  },
  modalLoader: {
    paddingVertical: 28,
  },
  pickerList: {
    marginTop: 4,
  },
  pickerOption: {
    minHeight: 46,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#E6E6E6',
  },
  pickerOptionText: {
    color: '#222',
    fontSize: 15,
  },
  emptyModalText: {
    color: '#777',
    fontSize: 15,
    paddingVertical: 28,
    textAlign: 'center',
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
  monthButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  monthButtonText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
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
    backgroundColor: '#5A33C5',
  },
  dayText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
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
