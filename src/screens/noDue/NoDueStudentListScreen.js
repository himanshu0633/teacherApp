import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BadgeCheck, ClipboardCheck, UserRound, X} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const BLUE = '#0798EA';
const GREEN = '#28B94F';
const TEXT = '#202124';

const stripText = value =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const firstValue = (source, keys, fallback = '-') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return stripText(value);
    }
  }

  return fallback;
};

const getRows = data => {
  const rows =
    data?.res ||
    data?.response?.res ||
    data?.response?.rest ||
    data?.rest ||
    data?.response ||
    [];

  return Array.isArray(rows) ? rows : [];
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

const getTeacherContext = async () => {
  const [saved, empId, branchId] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('EmpID'),
    AsyncStorage.getItem('BranchId'),
  ]);

  let parsed = {};
  try {
    parsed = saved ? JSON.parse(saved) : {};
  } catch (error) {
    parsed = {};
  }

  return {
    EmpID: parsed?.EmpID || empId || '',
    BranchId: parsed?.BranchId || branchId || '',
  };
};

const normalizeNoDueStudent = (item, index) => ({
  id: firstValue(
    item,
    ['WithDrawalHeadingId', 'WithdrawalHeadingId', 'withDrawalHeadingId', 'id'],
    `no-due-${index}`,
  ),
  enrollNo: firstValue(item, ['EnrollNo', 'enrollNo', 'EnrollmentNo']),
  studentName: firstValue(item, ['StudentName', 'studentName', 'Name']),
  className: firstValue(item, ['Class', 'class', 'ClassName']),
  heading: firstValue(item, ['Heading', 'heading']),
  status: firstValue(item, ['Status', 'status'], 'Pending'),
});

function DetailItem({label, value}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function NoDueCard({student, updating, onApprove}) {
  const pending = String(student.status).trim().toLowerCase() === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <UserRound size={22} color={BLUE} strokeWidth={2} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.studentName} numberOfLines={2}>
            {student.studentName}
          </Text>
          <Text style={styles.enrollText}>Enroll No: {student.enrollNo}</Text>
        </View>
        <View style={[styles.statusPill, pending && styles.pendingPill]}>
          <Text style={[styles.statusText, pending && styles.pendingText]}>
            {student.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <DetailItem label="Class" value={student.className} />
        <DetailItem label="Heading" value={student.heading} />
      </View>

      {pending ? (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={updating}
          style={[styles.approveButton, updating && styles.disabledButton]}
          onPress={() => onApprove(student)}>
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <BadgeCheck size={18} color="#FFFFFF" strokeWidth={2.3} />
          )}
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function NoDueStudentListScreen({navigation}) {
  const [students, setStudents] = useState([]);
  const [context, setContext] = useState({EmpID: '', BranchId: ''});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarks, setRemarks] = useState('');

  const loadStudents = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const teacherContext = await getTeacherContext();
      setContext(teacherContext);

      if (!teacherContext.EmpID || !teacherContext.BranchId) {
        Alert.alert('Error', 'Employee or branch details not found.');
        return;
      }

      const payload = {
        EmpID: teacherContext.EmpID,
        BranchId: teacherContext.BranchId,
      };
      const data = await postForm(API_ENDPOINTS.NO_DUE_STUDENT_LIST, payload);
      console.log('NO DUE STUDENT LIST PAYLOAD =>', payload);
      console.log('NO DUE STUDENT LIST RESPONSE =>', data);

      if (isSuccess(data)) {
        setStudents(getRows(data).map(normalizeNoDueStudent));
        return;
      }

      setStudents([]);
      Alert.alert('Error', data?.msg || data?.message || 'No due list could not be loaded.');
    } catch (error) {
      console.log('NO DUE STUDENT LIST ERROR =>', error);
      Alert.alert('Error', 'No due list could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const closeApproveModal = () => {
    setSelectedStudent(null);
    setRemarks('');
  };

  const approveStudent = async () => {
    const student = selectedStudent;

    if (!student || updatingId) {
      return;
    }

    if (!context.BranchId) {
      Alert.alert('Error', 'Branch details not found.');
      return;
    }

    setUpdatingId(student.id);

    try {
      const payload = {
        BranchId: context.BranchId,
        WithDrawalHeadingId: student.id,
        Response: 'Approve',
        Remarks: remarks.trim(),
      };
      const data = await postForm(API_ENDPOINTS.APPROVE_NO_DUE, payload);
      console.log('APPROVE NO DUE PAYLOAD =>', payload);
      console.log('APPROVE NO DUE RESPONSE =>', data);

      if (isSuccess(data)) {
        closeApproveModal();
        Alert.alert('Success', data?.message || 'No due approved.');
        await loadStudents(false);
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'No due could not be approved.');
    } catch (error) {
      console.log('APPROVE NO DUE ERROR =>', error);
      Alert.alert('Error', 'No due could not be approved.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="No Due List"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={BLUE}
              colors={[BLUE]}
              onRefresh={() => loadStudents(false)}
            />
          }>
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <ClipboardCheck size={20} color={BLUE} strokeWidth={2.1} />
              <Text style={styles.summaryLabel}>Total No Due Request</Text>
            </View>
            <Text style={styles.summaryCount}>
              {String(students.length).padStart(2, '0')}
            </Text>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={BLUE} />
              <Text style={styles.loadingText}>Loading no due list...</Text>
            </View>
          ) : students.length ? (
            students.map(student => (
              <NoDueCard
                key={`${student.id}-${student.enrollNo}`}
                student={student}
                updating={updatingId === student.id}
                onApprove={item => {
                  setSelectedStudent(item);
                  setRemarks('');
                }}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No due request found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={!!selectedStudent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Approve No Due</Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.closeButton}
                onPress={closeApproveModal}>
                <X size={20} color={TEXT} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalStudent} numberOfLines={2}>
              {selectedStudent?.studentName}
            </Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              multiline
              placeholder="Enter remarks"
              placeholderTextColor="#8A8A8A"
              style={styles.remarksInput}
              textAlignVertical="top"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!!updatingId}
              style={[styles.modalApproveButton, !!updatingId && styles.disabledButton]}
              onPress={approveStudent}>
              {updatingId ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <BadgeCheck size={18} color="#FFFFFF" strokeWidth={2.3} />
              )}
              <Text style={styles.modalApproveText}>Approve</Text>
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 34,
  },
  summaryCard: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D7EFFD',
    backgroundColor: '#F1FBFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  summaryLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCount: {
    color: BLUE,
    fontSize: 18,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E4EAF0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 13,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  studentName: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  enrollText: {
    color: '#68707A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  statusPill: {
    borderRadius: 6,
    backgroundColor: '#EAF9EF',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pendingPill: {
    backgroundColor: '#FFF4DF',
  },
  statusText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  pendingText: {
    color: '#D98A00',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  detailItem: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F7F9FB',
    padding: 10,
  },
  detailLabel: {
    color: '#7A838D',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
  },
  approveButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.65,
  },
  centerBox: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#616B75',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#7A7A7A',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStudent: {
    color: '#616B75',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 7,
  },
  remarksInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: '#D8E1EA',
    borderRadius: 8,
    color: TEXT,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 10,
    marginTop: 14,
  },
  modalApproveButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
  },
  modalApproveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
