import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CheckCircle2, Eye} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const BLUE = '#079CEF';
const TEXT = '#252525';

const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
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

const rows = data => {
  if (data?.EnrollNo || data?.StudentName || data?.name) {
    return [data];
  }

  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response?.res ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    data?.Res ||
    data?.res ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const firstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const normalizeStudent = item => ({
  name: firstValue(item, ['StudentName', 'studentname', 'name', 'Name', 'stname']),
  enrollNo: firstValue(item, [
    'EnrollNo',
    'enrollno',
    'AdmissionNo',
    'AdmNo',
    'adminno',
  ]),
  className: firstValue(item, ['ClassName', 'classname', 'Class', 'className']),
  sectionName: firstValue(item, [
    'SectionName',
    'sectionName',
    'sectionname',
    'Section',
    'section',
    'section_name',
  ]),
  rollNo: firstValue(item, ['RollNo', 'rollNo', 'rollno', 'Roll', 'roll', 'roll_no']),
});

const mergeStudentDetails = (baseStudent, detailStudent) => ({
  name: detailStudent.name || baseStudent.name,
  enrollNo: detailStudent.enrollNo || baseStudent.enrollNo,
  className: detailStudent.className || baseStudent.className,
  sectionName: detailStudent.sectionName || baseStudent.sectionName,
  rollNo: detailStudent.rollNo || baseStudent.rollNo,
});

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return status === 'success' || status === 'true';
};

export default function HostelParentingScreen({navigation}) {
  const [searchText, setSearchText] = useState('');
  const [student, setStudent] = useState(null);
  const [description, setDescription] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const date = useMemo(todayText, []);

  const handleSearch = async () => {
    const query = searchText.trim();

    if (!query) {
      Alert.alert('Required', 'Please enter student name or admission number.');
      return;
    }

    setSearching(true);
    try {
      const context = await getTeacherContext();
      if (!context.BranchId || !context.SessionId) {
        Alert.alert('Error', 'Branch or session details not found.');
        return;
      }

      const numericSearch = /^\d+$/.test(query);
      const payload = {
        adminno: numericSearch ? query : '',
        name: numericSearch ? '' : query,
        BranchId: context.BranchId,
        SessionId: context.SessionId,
      };

      console.log('HOSTEL PARENTING STUDENT SEARCH PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STUDENT_SEARCH, payload);
      console.log('HOSTEL PARENTING STUDENT SEARCH RESPONSE =>', data);

      if (data?.status !== 'true') {
        setStudent(null);
        Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      const [searchedStudent] = rows(data).map(normalizeStudent);

      if (!searchedStudent?.enrollNo) {
        setStudent(null);
        Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      let nextStudent = searchedStudent;

      if (!nextStudent.sectionName || !nextStudent.rollNo) {
        try {
          const detailPayload = {
            EmpCode: context.EmpCode,
            BranchId: context.BranchId,
            ClassId: '',
            EnrollNo: nextStudent.enrollNo,
          };

          console.log('HOSTEL PARENTING STUDENT DETAIL PAYLOAD =>', detailPayload);
          const detailData = await postForm(API_ENDPOINTS.STUDENT_LIST, detailPayload);
          console.log('HOSTEL PARENTING STUDENT DETAIL RESPONSE =>', detailData);
          const [detailStudent] = rows(detailData).map(normalizeStudent);

          if (detailStudent) {
            nextStudent = mergeStudentDetails(nextStudent, detailStudent);
          }
        } catch (detailError) {
          console.log('HOSTEL PARENTING STUDENT DETAIL ERROR =>', detailError);
        }
      }

      setStudent(nextStudent);
      setSearchText(nextStudent.enrollNo || query);
    } catch (error) {
      console.log('HOSTEL PARENTING SEARCH ERROR =>', error);
      Alert.alert('Error', 'Student search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!student?.enrollNo) {
      Alert.alert('Required', 'Please search and select a student.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required', 'Please enter description.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        EnrollNo: student.enrollNo,
        description: description.trim(),
        EmpCode: context.EmpCode,
      };

      console.log('HOSTEL PARENTING SAVE PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.HOSTEL_PARENTING_REMARKS, payload);
      console.log('HOSTEL PARENTING SAVE RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.message || data?.msg || 'Remark saved.');
        setDescription('');
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Remark could not be saved.');
    } catch (error) {
      console.log('HOSTEL PARENTING SAVE ERROR =>', error);
      Alert.alert('Error', 'Remark could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Hostel Parenting"
        onBack={() => navigation.goBack()}
        safeAreaTop
        rightIcon={<Eye size={22} color="#fff" strokeWidth={2.4} />}
        rightAction={() => navigation.navigate('HostelParentingListScreen')}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inputBox}>
            <Text style={styles.smallLabel}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.inputText}>{date}</Text>
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by Name / Adm No. *"
            placeholderTextColor={TEXT}
            style={styles.textInput}
          />

          <TouchableOpacity
            activeOpacity={0.84}
            style={[styles.searchButton, searching && styles.disabledButton]}
            disabled={searching}
            onPress={handleSearch}>
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>

          {student ? <StudentCard student={student} /> : null}

          <View style={styles.descriptionBox}>
            <Text style={styles.smallLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="write here..."
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
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StudentCard({student}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{student.name || '-'}</Text>
        <CheckCircle2 size={22} color="#25B83D" strokeWidth={2.2} />
      </View>

      <View style={styles.studentGrid}>
        <Info label="Admission No." value={student.enrollNo || '-'} />
        <Info label="Class" value={student.className || '-'} />
        <Info label="Section" value={student.sectionName || '-'} />
        <Info label="Roll No." value={student.rollNo || '-'} />
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 28, paddingTop: 35, paddingBottom: 32},
  inputBox: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  smallLabel: {fontSize: 10, color: '#777'},
  required: {color: 'red'},
  inputText: {fontSize: 14, color: TEXT, marginTop: 2},
  textInput: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 16,
    color: TEXT,
    fontSize: 14,
    marginBottom: 16,
  },
  searchButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  searchButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  studentCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C8E4F4',
    backgroundColor: '#EFFAFF',
    marginBottom: 20,
    overflow: 'hidden',
  },
  studentHeader: {
    height: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {fontSize: 13, color: TEXT, fontWeight: '700'},
  studentGrid: {flexDirection: 'row', flexWrap: 'wrap', padding: 15},
  infoCell: {width: '50%', marginBottom: 13},
  infoLabel: {fontSize: 12, color: '#777', marginBottom: 5},
  infoValue: {fontSize: 13, color: TEXT, fontWeight: '700'},
  descriptionBox: {
    minHeight: 129,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 15,
    paddingTop: 10,
    marginBottom: 26,
  },
  descriptionInput: {
    flex: 1,
    padding: 0,
    marginTop: 4,
    color: TEXT,
    fontSize: 14,
    minHeight: 92,
  },
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  disabledButton: {opacity: 0.65},
});
