import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS, BASE_URL} from '../../utils/constants';

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

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
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

const normalizeClassSection = item => ({
  id: getFirstValue(item, ['Classid', 'ClassId', 'classid', 'id']),
  name: getFirstValue(item, ['ClassName', 'Class', 'classname', 'name']),
  sectionId: getFirstValue(item, ['SectionId', 'SectionID', 'sectionid']),
});

const normalizeOption = (item, labelKeys = ['head', 'name']) => {
  const label = getFirstValue(item, labelKeys);

  return {
    id: getFirstValue(item, ['id', 'Id', 'ID'], label),
    name: label,
  };
};

const normalizeSubject = item => ({
  id: getFirstValue(item, ['SubjectId', 'subjectid', 'id']),
  name: getFirstValue(item, ['SubjectName', 'subjectname', 'name']),
  examId: getFirstValue(item, ['examid', 'ExamId', 'examId']),
});

const normalizeStudent = item => ({
  id: getFirstValue(item, ['StudentId', 'studentid']),
  detailId: getFirstValue(item, ['StudentDetailId', 'studentdetailid']),
  name: getFirstValue(item, ['StudentName', 'studentname']),
  roll: getFirstValue(item, ['RollNo', 'rollno']),
  adm: getFirstValue(item, ['EnrollNo', 'enrollno']),
  marks: getFirstValue(item, ['savedmarks', 'marks'], '0'),
  status: getFirstValue(item, ['Attendence', 'Attendance', 'status'], 'P'),
  max: getFirstValue(item, ['Max', 'max']),
  locked: getFirstValue(item, ['locked', 'Locked'], 'No'),
});

async function loadTeacherContext() {
  const raw = await AsyncStorage.getItem('teacherData');
  const parsed = raw ? JSON.parse(raw) : {};
  const [empCode, empId, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('EmpID'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);

  return {
    ...parsed,
    EmpCode: parsed?.EmpCode || empCode || '',
    EmpID: parsed?.EmpID || empId || '',
    BranchId: parsed?.BranchId || branchId || '',
    SessionId:
      parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
}

export default function MarkEntryScreen({navigation}) {
  const [showStudents, setShowStudents] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [teacher, setTeacher] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [examHeads, setExamHeads] = useState([]);
  const [selectedExamHead, setSelectedExamHead] = useState(null);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [examTests, setExamTests] = useState([]);
  const [selectedExamTest, setSelectedExamTest] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [selectedPaperType, setSelectedPaperType] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [totalMarks, setTotalMarks] = useState('');
  const [examDate, setExamDate] = useState('');
  const [activePicker, setActivePicker] = useState(null);
  const [loadingField, setLoadingField] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [sno, setSno] = useState('');
  const [locked, setLocked] = useState('No');

  const [students, setStudents] = useState([]);

  const commonPayload = useCallback(
    () => ({
      SessionId: teacher.SessionId,
      BranchId: teacher.BranchId,
    }),
    [teacher],
  );

  const resetAfterClass = () => {
    setExamHeads([]);
    setSelectedExamHead(null);
    resetAfterHead();
  };

  const resetAfterHead = () => {
    setExamTypes([]);
    setSelectedExamType(null);
    resetAfterExamType();
  };

  const resetAfterExamType = () => {
    setExamTests([]);
    setSelectedExamTest(null);
    resetAfterTest();
  };

  const resetAfterTest = () => {
    setPaperTypes([]);
    setSelectedPaperType(null);
    resetAfterPaperType();
  };

  const resetAfterPaperType = () => {
    setSubjects([]);
    setSelectedSubject(null);
    setTotalMarks('');
    setExamDate('');
    setStudents([]);
    setShowStudents(false);
    setSno('');
    setLocked('No');
  };

  const loadClassSections = useCallback(async () => {
    try {
      const teacherContext = await loadTeacherContext();
      setTeacher(teacherContext);

      if (
        !teacherContext?.EmpCode ||
        !teacherContext?.SessionId ||
        !teacherContext?.BranchId
      ) {
        return;
      }

      setLoadingClasses(true);
      const data = await postForm(API_ENDPOINTS.MARKS_CLASS_SEC, {
        EmpCode: teacherContext.EmpCode,
        SessionId: teacherContext.SessionId,
        BranchId: teacherContext.BranchId,
      });
      const list = getListFromResponse(data)
        .map(normalizeClassSection)
        .filter(item => item.id && item.name && item.sectionId);

      setClasses(list);
    } catch (error) {
      console.log('marksclasssec.php CALL ERROR =>', error);
      Alert.alert('Error', 'Class list load nahi ho payi.');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    loadClassSections();
  }, [loadClassSections]);

  const loadExamHeads = async classItem => {
    try {
      setLoadingField('head');
      const data = await postForm(API_ENDPOINTS.EXAM_HEAD, {
        classid: classItem.id,
        ...commonPayload(),
      });
      const list = getListFromResponse(data)
        .map(item => normalizeOption(item, ['head']))
        .filter(item => item.id && item.name);

      setExamHeads(list);
      if (!list.length) {
        Alert.alert('No Data', 'Exam head list empty hai.');
      }
    } catch (error) {
      console.log('examhead.php CALL ERROR =>', error);
      Alert.alert('Error', 'Exam head load nahi ho paya.');
    } finally {
      setLoadingField('');
    }
  };

  const loadExamTypes = async headItem => {
    try {
      setLoadingField('type');
      const data = await postForm(API_ENDPOINTS.EXAM_TYPE, {
        classid: selectedClass.id,
        ...commonPayload(),
        headid: headItem.id,
      });
      const list = getListFromResponse(data)
        .map(item => normalizeOption(item, ['head']))
        .filter(item => item.id && item.name);

      setExamTypes(list);
      if (!list.length) {
        Alert.alert('No Data', 'Exam type list empty hai.');
      }
    } catch (error) {
      console.log('examtype.php CALL ERROR =>', error);
      Alert.alert('Error', 'Exam type load nahi ho paya.');
    } finally {
      setLoadingField('');
    }
  };

  const loadExamTests = async typeItem => {
    try {
      setLoadingField('test');
      const data = await postForm(API_ENDPOINTS.GET_EXAM_TEST, {
        classid: selectedClass.id,
        ...commonPayload(),
        headid: selectedExamHead.id,
        typeid: typeItem.id,
      });
      const list = getListFromResponse(data)
        .map(item => normalizeOption(item, ['test']))
        .filter(item => item.name);

      setExamTests(list);
      if (!list.length) {
        Alert.alert('No Data', 'Exam test list empty hai.');
      }
    } catch (error) {
      console.log('getexamtest.php CALL ERROR =>', error);
      Alert.alert('Error', 'Exam test load nahi ho paya.');
    } finally {
      setLoadingField('');
    }
  };

  const loadPaperTypes = async testItem => {
    try {
      setLoadingField('paper');
      const data = await postForm(API_ENDPOINTS.PAPER_TYPE, {
        classid: selectedClass.id,
        ...commonPayload(),
        headid: selectedExamHead.id,
        typeid: selectedExamType.id,
        test: testItem.name,
      });
      const list = getListFromResponse(data)
        .map(item => normalizeOption(item, ['Type']))
        .filter(item => item.name);

      setPaperTypes(list);
      if (!list.length) {
        Alert.alert('No Data', 'Paper type list empty hai.');
      }
    } catch (error) {
      console.log('papertype.php CALL ERROR =>', error);
      Alert.alert('Error', 'Paper type load nahi ho paya.');
    } finally {
      setLoadingField('');
    }
  };

  const loadSubjects = async paperTypeItem => {
    try {
      setLoadingField('subject');
      const data = await postForm(API_ENDPOINTS.GET_SUBJECTS, {
        classid: selectedClass.id,
        ...commonPayload(),
        headid: selectedExamHead.id,
        examtypeid: selectedExamType.id,
        test: selectedExamTest.name,
        type: paperTypeItem.name,
        EmpCode: teacher.EmpCode,
        SectionId: selectedClass.sectionId,
      });
      const list = getListFromResponse(data)
        .map(normalizeSubject)
        .filter(item => item.id && item.name);

      setSubjects(list);
      if (!list.length) {
        Alert.alert('No Data', data?.message || 'Subject list empty hai.');
      }
    } catch (error) {
      console.log('getsubjects.php CALL ERROR =>', error);
      Alert.alert('Error', 'Subject load nahi ho paya.');
    } finally {
      setLoadingField('');
    }
  };

  const loadTotalMarks = async subjectItem => {
    try {
      setLoadingField('marks');
      const data = await postForm(API_ENDPOINTS.GET_TOTAL_MARKS, {
        classid: selectedClass.id,
        ...commonPayload(),
        headid: selectedExamHead.id,
        examtypeid: selectedExamType.id,
        test: selectedExamTest.name,
        type: selectedPaperType.name,
        subid: subjectItem.id,
      });

      setTotalMarks(getFirstValue(data, ['total', 'Total']));
      setExamDate(getFirstValue(data, ['examdate', 'ExamDate']));
    } catch (error) {
      console.log('gettotalmarks.php CALL ERROR =>', error);
      Alert.alert('Error', 'Maximum marks load nahi ho paye.');
    } finally {
      setLoadingField('');
    }
  };

  const updateMarks = (id, marks) => {
    setStudents(prev =>
      prev.map(item => (item.id === id ? {...item, marks} : item)),
    );
  };

  const openStatus = id => {
    setSelectedStudentId(id);
    setStatusModal(true);
  };

  const updateStatus = status => {
    setStudents(prev =>
      prev.map(item =>
        item.id === selectedStudentId ? {...item, status} : item,
      ),
    );
    setStatusModal(false);
  };

  const selectClass = item => {
    setSelectedClass(item);
    resetAfterClass();
    setActivePicker(null);
    loadExamHeads(item);
  };

  const selectExamHead = item => {
    setSelectedExamHead(item);
    resetAfterHead();
    setActivePicker(null);
    loadExamTypes(item);
  };

  const selectExamType = item => {
    setSelectedExamType(item);
    resetAfterExamType();
    setActivePicker(null);
    loadExamTests(item);
  };

  const selectExamTest = item => {
    setSelectedExamTest(item);
    resetAfterTest();
    setActivePicker(null);
    loadPaperTypes(item);
  };

  const selectPaperType = item => {
    setSelectedPaperType(item);
    resetAfterPaperType();
    setActivePicker(null);
    loadSubjects(item);
  };

  const selectSubject = item => {
    setSelectedSubject(item);
    setStudents([]);
    setShowStudents(false);
    setSno('');
    setLocked('No');
    setActivePicker(null);
    loadTotalMarks(item);
  };

  const requireSelection = () => {
    if (!selectedClass?.id) {
      Alert.alert('Required', 'Class select karein.');
      return false;
    }

    if (!selectedExamHead?.id) {
      Alert.alert('Required', 'Exam Head select karein.');
      return false;
    }

    if (!selectedExamType?.id) {
      Alert.alert('Required', 'Exam Type select karein.');
      return false;
    }

    if (!selectedExamTest?.name) {
      Alert.alert('Required', 'Exam Test select karein.');
      return false;
    }

    if (!selectedPaperType?.name) {
      Alert.alert('Required', 'Type select karein.');
      return false;
    }

    if (!selectedSubject?.id) {
      Alert.alert('Required', 'Subject select karein.');
      return false;
    }

    if (!totalMarks) {
      Alert.alert('Required', 'Maximum Marks load nahi hue.');
      return false;
    }

    return true;
  };

  const marksPayload = () => ({
    classid: selectedClass.id,
    ...commonPayload(),
    headid: selectedExamHead.id,
    examtypeid: selectedExamType.id,
    test: selectedExamTest.name,
    type: selectedPaperType.name,
    subid: selectedSubject.id,
    sectionid: selectedClass.sectionId,
    Max: totalMarks,
    examid: selectedSubject.examId,
  });

  const showStudentMarks = async () => {
    if (!requireSelection()) {
      return;
    }

    try {
      setLoadingStudents(true);
      const data = await postForm(API_ENDPOINTS.ADD_MARKS, marksPayload());

      if (!data || data?.status === 'Failed' || data?.status === false) {
        Alert.alert('No Data', data?.message || 'Student list nahi mili.');
        setStudents([]);
        setShowStudents(false);
        return;
      }

      const list = getListFromResponse(data)
        .map(normalizeStudent)
        .filter(item => item.id && item.detailId);

      setStudents(list);
      setSno(getFirstValue(data, ['sno']));
      setLocked(getFirstValue(data, ['locked'], 'No'));
      setShowStudents(true);
    } catch (error) {
      console.log('addmarks1.php CALL ERROR =>', error);
      Alert.alert('Error', 'Student marks load nahi ho paye.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const saveMarks = async nextLocked => {
    if (!students.length) {
      Alert.alert('Required', 'Pehle students show karein.');
      return;
    }

    try {
      setSavingMarks(true);
      const data = await postForm(API_ENDPOINTS.SAVE_MARKS, {
        ...marksPayload(),
        LoginId: teacher.EmpID || teacher.EmpCode,
        marks: students.map(item => item.marks || '0').join(','),
        studentid: students.map(item => item.id).join(','),
        studentdetailid: students.map(item => item.detailId).join(','),
        Attendence: students.map(item => item.status || 'P').join(','),
        locked: nextLocked,
        sno,
      });

      if (data?.status === 'Failed' || data?.status === false) {
        Alert.alert('Error', data?.message || 'Marks save nahi ho paye.');
        return;
      }

      setLocked(nextLocked);
      Alert.alert('Success', data?.message || 'Marks save ho gaye.');
    } catch (error) {
      console.log('savemarks1.php CALL ERROR =>', error);
      Alert.alert('Error', 'Marks save nahi ho paye.');
    } finally {
      setSavingMarks(false);
    }
  };

  const pickerConfig = {
    class: {
      title: 'Select Class',
      items: classes,
      loading: loadingClasses,
      onSelect: selectClass,
    },
    head: {
      title: 'Select Exam Head',
      items: examHeads,
      loading: loadingField === 'head',
      onSelect: selectExamHead,
    },
    type: {
      title: 'Select Exam Type',
      items: examTypes,
      loading: loadingField === 'type',
      onSelect: selectExamType,
    },
    test: {
      title: 'Select Exam Test',
      items: examTests,
      loading: loadingField === 'test',
      onSelect: selectExamTest,
    },
    paper: {
      title: 'Select Type',
      items: paperTypes,
      loading: loadingField === 'paper',
      onSelect: selectPaperType,
    },
    subject: {
      title: 'Select Subject',
      items: subjects,
      loading: loadingField === 'subject',
      onSelect: selectSubject,
    },
  };

  const currentPicker = pickerConfig[activePicker];
  const isLocked = String(locked).toLowerCase() === 'yes';

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Marks Entry"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        {!showStudents ? (
          <ScrollView contentContainerStyle={styles.formContent}>
            <SelectBox
              label="Class"
              value={selectedClass?.name || 'Class'}
              smallLabel={Boolean(selectedClass)}
              loading={loadingClasses}
              onPress={() => setActivePicker('class')}
            />
            <SelectBox
              label="Exam Head"
              value={selectedExamHead?.name || 'Exam Head'}
              smallLabel={Boolean(selectedExamHead)}
              loading={loadingField === 'head'}
              disabled={!selectedClass}
              onPress={() => setActivePicker('head')}
            />
            <SelectBox
              label="Exam Type"
              value={selectedExamType?.name || 'Exam Type'}
              smallLabel={Boolean(selectedExamType)}
              loading={loadingField === 'type'}
              disabled={!selectedExamHead}
              onPress={() => setActivePicker('type')}
            />
            <SelectBox
              label="Exam Test"
              value={selectedExamTest?.name || 'Exam Test'}
              smallLabel={Boolean(selectedExamTest)}
              loading={loadingField === 'test'}
              disabled={!selectedExamType}
              onPress={() => setActivePicker('test')}
            />
            <SelectBox
              label="Type"
              value={selectedPaperType?.name || 'Type'}
              smallLabel={Boolean(selectedPaperType)}
              loading={loadingField === 'paper'}
              disabled={!selectedExamTest}
              onPress={() => setActivePicker('paper')}
            />
            <SelectBox
              label="Subject"
              value={selectedSubject?.name || 'Subject'}
              smallLabel={Boolean(selectedSubject)}
              loading={loadingField === 'subject'}
              disabled={!selectedPaperType}
              onPress={() => setActivePicker('subject')}
            />
            <SelectBox
              label="Maximum Marks"
              value={totalMarks || 'Maximum Marks'}
              smallLabel={Boolean(totalMarks)}
              loading={loadingField === 'marks'}
              disabled
            />
            <SelectBox
              label="Exam Date"
              value={examDate || 'Exam Date'}
              smallLabel={Boolean(examDate)}
              disabled
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.showBtn, loadingStudents && styles.disabledBtn]}
              disabled={loadingStudents}
              onPress={showStudentMarks}>
              {loadingStudents ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.showText}>Show</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.studentScreen}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.studentContent}>
              <Text style={styles.classTitle}>{selectedClass?.name || '-'}</Text>
              <Text style={styles.examInfo}>
                {selectedExamHead?.name} - {selectedExamType?.name} -{' '}
                {selectedPaperType?.name} - {selectedSubject?.name} - Max Marks{' '}
                {totalMarks}
              </Text>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Students</Text>
                <Text style={styles.totalCount}>{students.length}</Text>
              </View>

              {students.map(item => (
                <StudentCard
                  key={item.id}
                  item={item}
                  locked={isLocked}
                  onMarksChange={updateMarks}
                  onStatusPress={openStatus}
                />
              ))}
            </ScrollView>

            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (savingMarks || isLocked) && styles.disabledBtn,
                ]}
                disabled={savingMarks || isLocked}
                onPress={() => saveMarks('No')}>
                <Text style={styles.bottomBtnText}>
                  {savingMarks ? 'Saving...' : 'Save Marks'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.lockBtn,
                  (savingMarks || isLocked) && styles.disabledBtn,
                ]}
                disabled={savingMarks || isLocked}
                onPress={() => saveMarks('Yes')}>
                <Text style={styles.bottomBtnText}>
                  {isLocked ? 'Locked' : 'Lock Marks'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal visible={statusModal} transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setStatusModal(false)}>
            <View style={styles.statusPanel}>
              <StatusButton
                title="Present"
                style={styles.presentBtn}
                onPress={() => updateStatus('P')}
              />
              <StatusButton
                title="Absent"
                style={styles.absentBtn}
                onPress={() => updateStatus('A')}
              />
              <StatusButton
                title="Medical"
                style={styles.medicalBtn}
                onPress={() => updateStatus('M')}
              />
              <StatusButton
                title="Exempted"
                style={styles.exemptedBtn}
                onPress={() => updateStatus('E')}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <PickerModal
          visible={Boolean(activePicker)}
          title={currentPicker?.title || ''}
          items={currentPicker?.items || []}
          loading={Boolean(currentPicker?.loading)}
          onClose={() => setActivePicker(null)}
          onSelect={currentPicker?.onSelect || (() => {})}
        />
      </SafeAreaView>
    </View>
  );
}

function SelectBox({label, value, smallLabel, loading, disabled, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.selectBox, disabled && styles.disabledSelectBox]}
      disabled={disabled || loading}
      onPress={onPress}>
      <View>
        {smallLabel && (
          <Text style={styles.smallSelectLabel}>
            {label} <Text style={styles.star}>*</Text>
          </Text>
        )}

        <Text style={[styles.selectText, disabled && styles.disabledText]}>
          {smallLabel ? value : label} <Text style={styles.star}>*</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#5A33C5" size="small" />
      ) : (
        <Text style={styles.arrow}>⌄</Text>
      )}
    </TouchableOpacity>
  );
}

function PickerModal({visible, title, items, loading, onClose, onSelect}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.pickerOverlay}>
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
                  key={`${item.id}-${item.sectionId}`}
                  style={styles.pickerOption}
                  onPress={() => onSelect(item)}>
                  <Text style={styles.pickerOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyPickerText}>{title} list empty hai.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

function StudentCard({item, locked, onMarksChange, onStatusPress}) {
  const disabled = locked || String(item.locked).toLowerCase() === 'yes';
  const statusStyle =
    item.status === 'P'
      ? styles.statusPresent
      : item.status === 'A'
      ? styles.statusAbsent
      : item.status === 'M'
      ? styles.statusMedical
      : styles.statusExempted;

  return (
    <View style={[styles.studentCard, disabled && styles.disabledCard]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, disabled && styles.disabledText]}>
          {item.name}
        </Text>
        <Text style={[styles.studentMeta, disabled && styles.disabledText]}>
          Roll No: {item.roll}
        </Text>
        <Text style={[styles.studentMeta, disabled && styles.disabledText]}>
          Adm No: {item.adm}
        </Text>
      </View>

      <TextInput
        value={item.marks}
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={text => onMarksChange(item.id, text)}
        style={[styles.marksInput, disabled && styles.disabledText]}
      />

      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.statusCircle, statusStyle]}
        onPress={() => onStatusPress(item.id)}>
        <Text style={styles.statusText}>{item.status}</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatusButton({title, style, onPress}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.statusBtn, style]} onPress={onPress}>
      <Text style={styles.statusBtnText}>{title}</Text>
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

  formContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 30,
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
  smallSelectLabel: {
    fontSize: 9,
    color: '#777',
    marginBottom: 2,
  },
  selectText: {
    fontSize: 14,
    color: '#222',
  },
  star: {
    color: 'red',
  },
  arrow: {
    fontSize: 22,
    color: '#222',
    marginTop: -6,
  },
  showBtn: {
    height: 45,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  showText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  studentScreen: {
    flex: 1,
  },
  studentContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 100,
  },
  classTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  examInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  totalBox: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BFE3F9',
    backgroundColor: '#F3FCFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  totalIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    fontWeight: '800',
  },
  totalCount: {
    fontSize: 14,
    color: '#009BEF',
    fontWeight: '900',
  },
  studentCard: {
    minHeight: 68,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BFE3F9',
    backgroundColor: '#fff',
    paddingHorizontal: 13,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledCard: {
    opacity: 0.35,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#222',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
  },
  marksInput: {
    width: 38,
    height: 32,
    padding: 0,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    textAlign: 'center',
    fontSize: 14,
    color: '#222',
  },
  statusCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPresent: {
    backgroundColor: '#CBF7C8',
  },
  statusAbsent: {
    backgroundColor: '#FFD1D1',
  },
  statusMedical: {
    backgroundColor: '#CBEFFF',
  },
  statusExempted: {
    backgroundColor: '#FFD1F0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15A2EF',
  },

  bottomButtons: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disabledSelectBox: {
    opacity: 0.65,
  },
  saveBtn: {
    width: '45%',
    height: 44,
    borderRadius: 7,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtn: {
    width: '45%',
    height: 44,
    borderRadius: 7,
    backgroundColor: '#039BE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  statusPanel: {
    marginTop: 60,
  },
  statusBtn: {
    height: 45,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  presentBtn: {
    backgroundColor: '#2FC82D',
  },
  absentBtn: {
    backgroundColor: '#FF494F',
  },
  medicalBtn: {
    backgroundColor: '#129CE5',
  },
  exemptedBtn: {
    backgroundColor: '#F124B8',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  pickerOverlay: {
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
  emptyPickerText: {
    color: '#777',
    fontSize: 15,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
