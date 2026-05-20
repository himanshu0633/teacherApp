import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, ChevronDown } from 'lucide-react-native';
import DisciplineHeader from './DisciplineHeader';
import { TEXT, disciplineStyles as styles } from './DisciplineStyles';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

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
    'SessionId',
    'Session',
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
    SessionId:
      parsed?.SessionId ||
      parsed?.Session ||
      stored.SessionId ||
      stored.Session ||
      '',
  };
};

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.data ||
    data?.Data ||
    data?.list ||
    data?.List ||
    data?.result ||
    data?.Result ||
    data?.students ||
    data?.Students ||
    data?.class ||
    data?.Class ||
    // common nested wrapper used by some APIs
    data?.response?.Res ||
    data?.response?.res ||
    data?.Res ||
    data?.res ||
    data?.response?.data ||
    []
  );
};

const normalizeClass = item => {
  const id =
    item?.ClassId ||
    item?.ClassID ||
    item?.classId ||
    item?.Classid ||
    item?.classid ||
    item?.ClassID ||
    item?.id ||
    item?.Id ||
    '';
  const name =
    item?.ClassName ||
    item?.className ||
    item?.Name ||
    item?.name ||
    item?.Class ||
    id;

  return {
    ...item,
    id: String(id),
    label: String(name || ''),
  };
};

const normalizeStudent = item => {
  const studentId = item?.StudentId || item?.studentid || item?.StudentID || '';
  const enrollNo =
    item?.EnrollNo ||
    item?.EnrollNoId ||
    item?.adminno ||
    item?.AdmissionNo ||
    item?.AdmissionNumber ||
    item?.AdmNo ||
    '';

  const admissionNo =
    item?.AdmissionNo || item?.AdmNo || item?.adminno || item?.EnrollNo || '';

  const name =
    item?.StudentName ||
    item?.studentname ||
    item?.Name ||
    item?.name ||
    'Student';

  return {
    ...item,
    id: String(studentId || enrollNo || admissionNo || item?.id || ''),
    studentId: String(studentId || ''),
    enrollNo: String(enrollNo || ''),
    name,
    admissionNo: String(admissionNo || ''),
    className: item?.ClassName || item?.className || item?.Class || '',
    section: item?.SectionName || item?.sectionName || item?.Section || '',
    rollNo: item?.RollNo || item?.rollNo || item?.Roll || '',
  };
};

function SelectInput({ placeholder, value, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={styles.input}
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.inputText, !value && styles.placeholderText]}>
        {value || placeholder}
      </Text>
      {!disabled ? (
        <ChevronDown size={19} color={TEXT} strokeWidth={2} />
      ) : null}
    </TouchableOpacity>
  );
}

function StudentCard({ student, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.studentCard, selected && styles.selectedStudentCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{student.name}</Text>
        <View style={[styles.checkCircle, selected && styles.checkedCircle]}>
          <Check
            size={14}
            color={selected ? '#FFFFFF' : '#B9DFF2'}
            strokeWidth={2.2}
          />
        </View>
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
          <Text style={styles.studentValue}>{student.section || '-'}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Roll No.</Text>
          <Text style={styles.studentValue}>{student.rollNo || '-'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DisciplineFeedbackScreen({ navigation, route }) {
  const [teacher, setTeacher] = useState(null);
  const [feedbackType, setFeedbackType] = useState(
    (route && route.params && route.params.feedbackType) || 'Smiley',
  );
  const [searchText, setSearchText] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classPickerVisible, setClassPickerVisible] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [paramPickerVisible, setParamPickerVisible] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(false);
  const [paramFilter, setParamFilter] = useState('');
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [otherParameter, setOtherParameter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searching, setSearching] = useState(false);

  const loadClasses = useCallback(async context => {
    const activeContext = context || (await getTeacherContext());

    if (!activeContext.BranchId) {
      return;
    }

    setLoadingClasses(true);
    try {
      const payload = { BranchId: activeContext.BranchId };
      console.log('DISCIPLINE CLASS LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.GET_ALL_CLASS, payload);
      console.log('DISCIPLINE CLASS LIST RESPONSE =>', data);
      const nextClasses = getRows(data)
        .map(normalizeClass)
        .filter(item => item.id && item.label);
      console.log('DISCIPLINE CLASS LIST NORMALIZED =>', nextClasses);
      setClasses(nextClasses);
    } catch (error) {
      console.log('DISCIPLINE CLASS LIST ERROR =>', error);
      Alert.alert('Error', 'Class list load nahi ho payi.');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    getTeacherContext()
      .then(context => {
        setTeacher(context);
        loadClasses(context);
      })
      .catch(error => {
        console.log('DISCIPLINE CONTEXT ERROR =>', error);
        setTeacher({});
      });
  }, [loadClasses]);

  // If teacher context updates later (BranchId becomes available), reload classes
  useEffect(() => {
    if (teacher && teacher.BranchId) {
      loadClasses(teacher);
    }
  }, [teacher, loadClasses]);

  const searchStudents = async () => {
    const context = teacher || (await getTeacherContext());

    if (!context.BranchId || !context.SessionId) {
      Alert.alert('Error', 'Branch ya session detail nahi mili.');
      return;
    }

    const query = searchText.trim();
    const isAdmissionSearch = /^\d+$/.test(query);

    setSearching(true);
    try {
      // If class selected or admission/enroll number provided, use studentlist.php which expects EmpCode, BranchId, ClassId, EnrollNo
      if (selectedClass || isAdmissionSearch) {
        const payload = {
          EmpCode: context.EmpCode || '',
          BranchId: context.BranchId || '',
          ClassId: selectedClass?.id || '',
          EnrollNo: isAdmissionSearch ? query : '',
        };

        console.log('DISCIPLINE STUDENT LIST PAYLOAD =>', payload);
        const data = await postForm(API_ENDPOINTS.STUDENT_LIST, payload);
        console.log('DISCIPLINE STUDENT LIST RESPONSE =>', data);
        const nextStudents = getRows(data)
          .map(normalizeStudent)
          .filter(item => item.id);
        console.log('DISCIPLINE STUDENT LIST NORMALIZED =>', nextStudents);
        setStudents(nextStudents);
        setSelectedStudents([]);
      } else {
        // Fallback: name based search using existing student search endpoint which expects name, BranchId, SessionId
        const payload = {
          name: query,
          BranchId: context.BranchId || '',
          SessionId: context.SessionId || '',
        };

        console.log('DISCIPLINE STUDENT SEARCH (NAME) PAYLOAD =>', payload);
        const data = await postForm(API_ENDPOINTS.STUDENT_SEARCH, payload);
        console.log('DISCIPLINE STUDENT SEARCH (NAME) RESPONSE =>', data);
        const nextStudents = getRows(data)
          .map(normalizeStudent)
          .filter(item => item.id);
        console.log('DISCIPLINE STUDENT SEARCH (NAME) NORMALIZED =>', nextStudents);
        setStudents(nextStudents);
        setSelectedStudents([]);
      }
    } catch (error) {
      console.log('DISCIPLINE STUDENT SEARCH ERROR =>', error);
      Alert.alert('Error', 'Students search nahi ho paye.');
    } finally {
      setSearching(false);
    }
  };

  const toggleStudent = student => {
    setSelectedStudents(current => {
      const exists = current.some(item => item.id === student.id);

      if (exists) {
        return current.filter(item => item.id !== student.id);
      }

      return [...current, student];
    });
  };

  const resetSearch = () => {
    setSearchText('');
    setSelectedClass(null);
    setStudents([]);
    setSelectedStudents([]);
  };

  const handleSubmit = async () => {
    if (!selectedStudents.length) {
      Alert.alert('Required', 'Please select at least one student');
      return;
    }

    const ctx = teacher || (await getTeacherContext());

    if (!ctx.BranchId || !ctx.SessionId || !ctx.EmpCode) {
      Alert.alert('Error', 'Branch/Session/EmpCode nahi mila');
      return;
    }

  const parameterId = selectedParameter?.id || '';
  const remarks = otherParameter?.trim() || '';
  const type = feedbackType || (route && route.params && route.params.feedbackType) || 'Smiley';

    setSubmitting(true);
    try {
      let successCount = 0;
      let failCount = 0;

      // The API in Postman expects single EnrollNo per request. Iterate selected students.
      for (const student of selectedStudents) {
        const payload = {
          Parameter: parameterId,
          Level: '',
          Type: type,
          EnrollNo: student.enrollNo || student.admissionNo || student.id,
          Session: ctx.SessionId,
          BranchId: ctx.BranchId,
          EmpCode: ctx.EmpCode,
          remarks,
        };

        console.log('DISCIPLINE SUBMIT PAYLOAD =>', payload);
        try {
          const data = await postForm(API_ENDPOINTS.UPDATEDISCIPLINE, payload);
          console.log('DISCIPLINE SUBMIT RESPONSE =>', data);
          const status = String(data?.status || '').toLowerCase();
          if (status === 'true' || status === 'success') {
            successCount += 1;
          } else {
            failCount += 1;
          }
        } catch (err) {
          console.log('DISCIPLINE SUBMIT ERROR =>', err);
          failCount += 1;
        }
      }

      if (successCount > 0 && failCount === 0) {
        Alert.alert('Success', `${successCount} feedback submitted successfully.`);
        // Reset selections
        setSelectedStudents([]);
        setSelectedParameter(null);
        setOtherParameter('');
      } else if (successCount > 0) {
        Alert.alert('Partial', `${successCount} succeeded, ${failCount} failed.`);
      } else {
        Alert.alert('Error', 'Feedback submit nahi hua.');
      }
    } catch (error) {
      console.log('DISCIPLINE SUBMIT FINAL ERROR =>', error);
      Alert.alert('Error', 'Feedback submit mein error aaya');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <DisciplineHeader title="Discipline" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.input}
            placeholder="Search by Name/Adm No."
            placeholderTextColor={TEXT}
            value={searchText}
            onChangeText={setSearchText}
          />

          <Text style={styles.orText}>OR</Text>

          <SelectInput
            placeholder={loadingClasses ? 'Loading Classes' : 'Search by Class'}
            value={selectedClass?.label || ''}
            disabled={loadingClasses}
            onPress={() => setClassPickerVisible(true)}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.searchButton,
                searching && styles.disabledButton,
              ]}
              disabled={searching}
              onPress={searchStudents}
              activeOpacity={0.82}
            >
              {searching ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionText}>Search</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetSearch}
              activeOpacity={0.82}
            >
              <Text style={styles.actionText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {students.length ? (
            students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                selected={selectedStudents.some(item => item.id === student.id)}
                onPress={() => toggleStudent(student)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Search se students yahan aayenge.
              </Text>
            </View>
          )}

          <View style={styles.submitPanel}>
            <View style={styles.panelInput}>
              <SelectInput
                placeholder={selectedParameter?.Reasons || 'Choose Parameter'}
                value={selectedParameter?.Reasons || ''}
                onPress={async () => {
                  // fetch parameters when opening picker
                  const ctx = teacher || (await getTeacherContext());
                  setParamPickerVisible(true);

                  if (parameters.length) {
                    return;
                  }

                  setLoadingParameters(true);
                  try {
                    const payload = { EmpCode: ctx.EmpCode || '', Type: 'Smiley' };
                    console.log('DISCIPLINE PARAMS PAYLOAD =>', payload);
                    const data = await postForm(API_ENDPOINTS.SEND_PARAMETER, payload);
                    console.log('DISCIPLINE PARAMS RESPONSE =>', data);
                    const rows = getRows(data).map(item => ({
                      id: item?.id || item?.Id || item?.ID || String(item?.id),
                      Reasons: item?.Reasons || item?.reasons || item?.reason || item?.Reason || '',
                    }));
                    setParameters(rows.filter(r => r.id));
                  } catch (error) {
            const type = feedbackType || 'Smiley';
                    Alert.alert('Error', 'Parameters load nahi huye');
                  } finally {
                    setLoadingParameters(false);
                  }
                }}
              />
            </View>
            <TextInput
              style={[styles.input, styles.panelInput]}
              placeholder="Add Other Parameter"
              placeholderTextColor={TEXT}
              value={otherParameter}
              onChangeText={setOtherParameter}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.82}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={classPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClassPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setClassPickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Class</Text>
            <View style={styles.classSearchWrap}>
              <TextInput
                placeholder="Search classes..."
                placeholderTextColor={TEXT}
                style={[styles.input, styles.classSearchInput]}
                value={classFilter}
                onChangeText={setClassFilter}
              />
            </View>
            {classes.length ? (
              (() => {
                const filter = classFilter.trim().toLowerCase();
                const filtered = filter
                  ? classes.filter(c => (c.label || '').toLowerCase().includes(filter))
                  : classes;

                return (
                  <ScrollView style={styles.modalList} nestedScrollEnabled>
                    {filtered.length ? (
                      filtered.map(classItem => (
                        <TouchableOpacity
                          key={classItem.id}
                          style={styles.modalOption}
                          onPress={() => {
                            setSelectedClass(classItem);
                            setClassPickerVisible(false);
                            setClassFilter('');
                          }}
                        >
                          <Text style={styles.modalOptionText}>{classItem.label}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.modalOption}>
                        <Text style={styles.modalOptionText}>No class found</Text>
                      </View>
                    )}
                  </ScrollView>
                );
              })()
            ) : (
              <View style={styles.modalOption}>
                <Text style={styles.modalOptionText}>
                  {loadingClasses ? 'Loading classes...' : 'No class found'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={paramPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setParamPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setParamPickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choose Parameter</Text>
            <TextInput
              placeholder="Search parameters..."
              placeholderTextColor={TEXT}
              style={[styles.input, styles.classSearchInput]}
              value={paramFilter}
              onChangeText={setParamFilter}
            />

            {loadingParameters ? (
              <View style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Loading...</Text>
              </View>
            ) : parameters.length ? (
              (() => {
                const filter = paramFilter.trim().toLowerCase();
                const filtered = filter
                  ? parameters.filter(p => (p.Reasons || '').toLowerCase().includes(filter))
                  : parameters;

                return (
                  <ScrollView style={styles.modalList} nestedScrollEnabled>
                    {filtered.length ? (
                      filtered.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={styles.modalOption}
                          onPress={() => {
                            setSelectedParameter(p);
                            setParamPickerVisible(false);
                            setParamFilter('');
                          }}
                        >
                          <Text style={styles.modalOptionText}>{p.Reasons}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.modalOption}>
                        <Text style={styles.modalOptionText}>No parameter found</Text>
                      </View>
                    )}
                  </ScrollView>
                );
              })()
            ) : (
              <View style={styles.modalOption}>
                <Text style={styles.modalOptionText}>No parameter found</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
