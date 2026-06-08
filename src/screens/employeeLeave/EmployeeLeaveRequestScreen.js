import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarDays, CircleCheck, CircleX} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const BLUE = '#0798EA';
const TEXT = '#202124';

const stripHtml = value =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\\\//g, '/')
    .replace(/\s+/g, ' ')
    .trim();

const firstValue = (source, keys, fallback = '-') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return stripHtml(value);
    }
  }

  return fallback;
};

const getRows = data => {
  const rows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(rows) ? rows : [];
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
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

const normalizeLeaveRequest = item => ({
  id: firstValue(item, ['LeaveId', 'leaveId', 'id', 'Id'], ''),
  employeeName: firstValue(item, ['EmpName', 'empName', 'employeeName']),
  empCode: firstValue(item, ['EmpCode', 'empCode']),
  dateFrom: firstValue(item, ['DateFrom', 'dateFrom']),
  dateTo: firstValue(item, ['DateTo', 'dateTo']),
  reason: firstValue(item, ['Reason', 'reason']),
  days: firstValue(item, ['Days', 'days'], '0'),
  leaveType: firstValue(item, ['LeaveType', 'leaveType'], ''),
  status: firstValue(item, ['Status', 'status'], 'Pending'),
});

function RequestInfo({label, value}) {
  return (
    <View style={styles.infoCol}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ActionButton({type, onPress, disabled}) {
  const isApprove = type === 'approve';
  const Icon = isApprove ? CircleCheck : CircleX;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        styles.actionButton,
        isApprove ? styles.approve : styles.reject,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}>
      <View style={styles.actionIconWrap}>
        <Icon
          size={15}
          color={isApprove ? '#26B83A' : '#FF4148'}
          strokeWidth={2.3}
        />
      </View>
      <Text style={styles.actionText}>{isApprove ? 'Approve' : 'Cancel'}</Text>
    </TouchableOpacity>
  );
}

function LeaveRequestCard({request, onAction, updating}) {
  const isPending = String(request.status).toLowerCase() === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Leave Detail</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <RequestInfo label="Employee Name" value={request.employeeName} />
          <RequestInfo label="Emp Code" value={request.empCode} />
        </View>

        <View style={styles.infoRow}>
          <RequestInfo label="Date From:" value={request.dateFrom} />
          <RequestInfo label="Date To:" value={request.dateTo} />
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Reason for Leave:</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
          {request.leaveType ? (
            <Text style={styles.leaveTypeText}>Leave Type: {request.leaveType}</Text>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.daysPill}>
            <View style={styles.dayCountCircle}>
              <Text style={styles.dayCount}>{request.days}</Text>
            </View>
            <Text style={styles.daysText}>Days</Text>
          </View>

          {isPending ? (
            <View style={styles.actions}>
              <ActionButton
                type="approve"
                disabled={updating}
                onPress={() => onAction(request, 'Approved')}
              />
              <ActionButton
                type="reject"
                disabled={updating}
                onPress={() => onAction(request, 'Cancelled')}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function EmployeeLeaveRequestScreen({navigation}) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const loadLeaveRequests = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const context = await getTeacherContext();

      if (!context.BranchId || !context.SessionId) {
        Alert.alert('Error', 'Branch or session details not found.');
        return;
      }

      const payload = {
        branchid: context.BranchId,
        SessionId: context.SessionId,
      };
      const data = await postForm(API_ENDPOINTS.EMPLOYEE_LEAVE_REQUEST, payload);
      console.log('EMPLOYEE LEAVE REQUEST PAYLOAD =>', payload);
      console.log('EMPLOYEE LEAVE REQUEST RESPONSE =>', data);
      setLeaveRequests(getRows(data).map(normalizeLeaveRequest));
    } catch (error) {
      console.log('EMPLOYEE LEAVE REQUEST ERROR =>', error);
      Alert.alert('Error', 'Employee leave requests could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  const updateLeaveStatus = useCallback(
    async (request, status) => {
      Alert.alert(
        'Leave Request',
        `${status === 'Approved' ? 'Approve' : 'Cancel'} ${
          request.employeeName
        }'s leave request?`,
        [
          {text: 'No', style: 'cancel'},
          {
            text: 'Yes',
            onPress: async () => {
              setUpdatingId(request.id);

              try {
                const payload = {
                  levelid: request.id,
                  status,
                };
                const data = await postForm(
                  API_ENDPOINTS.APPROVED_REJECT_LEAVE,
                  payload,
                );
                console.log('APPROVED REJECT LEAVE PAYLOAD =>', payload);
                console.log('APPROVED REJECT LEAVE RESPONSE =>', data);

                if (isSuccess(data)) {
                  Alert.alert('Success', data?.message || 'Leave request updated.');
                  await loadLeaveRequests(false);
                  return;
                }

                Alert.alert(
                  'Error',
                  data?.message || 'Leave request could not be updated.',
                );
              } catch (error) {
                console.log('APPROVED REJECT LEAVE ERROR =>', error);
                Alert.alert('Error', 'Leave request could not be updated.');
              } finally {
                setUpdatingId('');
              }
            },
          },
        ],
      );
    },
    [loadLeaveRequests],
  );

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Employee Leave Request"
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
              onRefresh={() => loadLeaveRequests(false)}
            />
          }>
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <CalendarDays size={20} color={BLUE} strokeWidth={2.1} />
              <Text style={styles.summaryLabel}>Total Leave Request</Text>
            </View>
            <Text style={styles.summaryCount}>
              {String(leaveRequests.length).padStart(2, '0')}
            </Text>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={BLUE} />
              <Text style={styles.loadingText}>Loading leave requests...</Text>
            </View>
          ) : leaveRequests.length ? (
            leaveRequests.map(request => (
              <LeaveRequestCard
                key={request.id || `${request.empCode}-${request.dateFrom}`}
                request={request}
                updating={updatingId === request.id}
                onAction={updateLeaveStatus}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No leave request found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: 19,
    paddingTop: 19,
    paddingBottom: 36,
  },
  summaryCard: {
    height: 45,
    borderWidth: 1,
    borderColor: '#CCE5F4',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 15,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 14,
  },
  summaryCount: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: '#C9E2F1',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E7EF',
    backgroundColor: '#EEF9FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  cardTitle: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 75,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FDBB1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 13,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  reasonBox: {
    minHeight: 63,
    borderRadius: 4,
    backgroundColor: '#DDF1FC',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 23,
  },
  reasonTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
  leaveTypeText: {
    color: '#6D7179',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  daysPill: {
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDF1FC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 13,
  },
  dayCountCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  dayCount: {
    color: TEXT,
    fontSize: 13,
  },
  daysText: {
    color: TEXT,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    height: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 13,
  },
  approve: {
    backgroundColor: '#25B938',
  },
  reject: {
    backgroundColor: '#FF4148',
  },
  disabledButton: {
    opacity: 0.58,
  },
  actionIconWrap: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 34,
  },
  loadingText: {
    color: '#6D7179',
    fontSize: 13,
    marginTop: 10,
  },
  emptyText: {
    color: '#6D7179',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 30,
  },
});
