import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {CircleCheck, CircleX, Clock, Eye, UserRound} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const TEXT = '#202124';
const GREEN = '#25B938';
const RED = '#FF4148';

const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const rows = data => {
  const nextRows =
    data?.response?.Rest ||
    data?.response?.rest ||
    data?.response ||
    data?.Rest ||
    data?.rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

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

const normalizeDate = value => {
  const text = stripHtml(value);
  const usDate = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (usDate) {
    return `${usDate[2]}-${usDate[1]}-${usDate[3]}`;
  }

  return text || '-';
};

const normalizeExtraDay = item => ({
  id: firstValue(item, ['id', 'Id', 'ID'], ''),
  empCode: firstValue(
    item,
    ['EmpCode', 'empCode', 'Empcode', 'empcode', 'EmployeeCode', 'employeeCode'],
    '',
  ),
  date: normalizeDate(firstValue(item, ['date', 'Date'])),
  reason: firstValue(item, ['reason', 'Reason']),
  requestBy: firstValue(item, ['EmpName', 'empName', 'name', 'RequestBy']),
  status: firstValue(item, ['status', 'Status'], 'Pending'),
});

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

const getTeacherContext = async () => {
  const [saved, empCode, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

function DetailCell({Icon, label, value}) {
  return (
    <View style={styles.detailCell}>
      <View style={styles.labelRow}>
        <Icon size={12} color={GREEN} strokeWidth={2} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ActionButton({type, onPress, disabled}) {
  const isApprove = type === 'approve';
  const Icon = isApprove ? CircleCheck : CircleX;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled}
      style={[
        styles.actionButton,
        isApprove ? styles.approveButton : styles.cancelButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}>
      <Icon size={15} color="#FFFFFF" strokeWidth={2.4} />
      <Text style={styles.actionText}>{isApprove ? 'Approve' : 'Cancel'}</Text>
    </TouchableOpacity>
  );
}

function ExtraDayCard({request, onAction, updating, canUpdate}) {
  const isApproved = String(request.status).toLowerCase() === 'approved';
  const isPending = String(request.status).toLowerCase() === 'pending';
  const statusStyle = isApproved
    ? styles.approvedPill
    : isPending
      ? styles.pendingPill
      : styles.cancelPill;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Request Detail</Text>
        <View style={[styles.statusPill, statusStyle]}>
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <DetailCell Icon={Clock} label="Request Date" value={request.date} />
          <DetailCell Icon={UserRound} label="Request By" value={request.requestBy} />
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Reason</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </View>

        {canUpdate && isPending ? (
          <View style={styles.actions}>
            <ActionButton
              type="approve"
              disabled={updating}
              onPress={() => onAction(request, 'Approved')}
            />
            <ActionButton
              type="cancel"
              disabled={updating}
              onPress={() => onAction(request, 'Cancel')}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ExtraDayRequestScreen({navigation, route}) {
  const isApprovalMode = route?.params?.mode === 'approval';
  const [date, setDate] = useState(todayText);
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [showList, setShowList] = useState(isApprovalMode);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  const listPayload = useCallback(
    async nextReason => {
      const context = await getTeacherContext();

      return {
        date: date.trim(),
        reason: nextReason ?? reason.trim(),
        BranchId: context.BranchId,
        SessionId: context.SessionId,
        EmpCode: context.EmpCode,
      };
    },
    [date, reason],
  );

  const loadRequests = useCallback(async (nextReason, showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const payload = await listPayload(nextReason);
      const endpoint = isApprovalMode
        ? API_ENDPOINTS.EMP_EXTRA_DAY_ENTRY_LIST
        : API_ENDPOINTS.EXTRA_DAY_ENTRY_LIST;
      const data = await postForm(endpoint, payload);
      console.log('EXTRA DAY ENTRY LIST ENDPOINT =>', endpoint);
      console.log('EXTRA DAY ENTRY LIST PAYLOAD =>', payload);
      console.log('EXTRA DAY ENTRY LIST RESPONSE =>', data);
      setRequests(rows(data).map(normalizeExtraDay));
    } catch (error) {
      console.log('EXTRA DAY ENTRY LIST ERROR =>', error);
      Alert.alert('Error', 'Extra day request list could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isApprovalMode, listPayload]);

  const openRequestList = () => {
    setShowList(true);
    loadRequests();
  };

  React.useEffect(() => {
    if (isApprovalMode) {
      loadRequests();
    }
  }, [isApprovalMode, loadRequests]);

  const updateExtraDayStatus = useCallback(
    async (request, status) => {
      Alert.alert(
        'Extra Day Request',
        `${status === 'Approved' ? 'Approve' : 'Cancel'} ${
          request.requestBy
        }'s extra day request?`,
        [
          {text: 'No', style: 'cancel'},
          {
            text: 'Yes',
            onPress: async () => {
              setUpdatingId(request.id);

              try {
                const payload = {
                  EmpCode: request.empCode,
                  id: request.id,
                  status,
                };
                const data = await postForm(
                  API_ENDPOINTS.APPROVED_EXTRA_DAY_STATUS,
                  payload,
                );
                console.log('APPROVED EXTRA DAY STATUS PAYLOAD =>', payload);
                console.log('APPROVED EXTRA DAY STATUS RESPONSE =>', data);

                if (isSuccess(data)) {
                  Alert.alert('Success', data?.msg || data?.message || 'Extra day request updated.');
                  await loadRequests(undefined, false);
                  return;
                }

                Alert.alert(
                  'Error',
                  data?.msg || data?.message || 'Extra day request could not be updated.',
                );
              } catch (error) {
                console.log('APPROVED EXTRA DAY STATUS ERROR =>', error);
                Alert.alert('Error', 'Extra day request could not be updated.');
              } finally {
                setUpdatingId('');
              }
            },
          },
        ],
      );
    },
    [loadRequests],
  );

  const handleSubmit = async () => {
    if (!date.trim() || !reason.trim()) {
      Alert.alert('Required', 'Please enter date and reason.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = await listPayload(reason.trim());
      const data = await postForm(API_ENDPOINTS.EXTRA_DAY, payload);
      console.log('EXTRA DAY REQUEST PAYLOAD =>', payload);
      console.log('EXTRA DAY REQUEST RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'Extra day request submitted.');
        setShowList(true);
        await loadRequests(reason.trim());
        setReason('');
        return;
      }

      Alert.alert('Error', data?.msg || data?.message || 'Extra day request could not be submitted.');
    } catch (error) {
      console.log('EXTRA DAY REQUEST ERROR =>', error);
      Alert.alert('Error', 'Extra day request could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const contentStyle = useMemo(
    () => [styles.content, showList ? styles.listContent : styles.formContent],
    [showList],
  );

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Extra Day Request"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            showList ? (
              <RefreshControl
                refreshing={refreshing}
                tintColor={PURPLE}
                colors={[PURPLE]}
                onRefresh={() => loadRequests(undefined, false)}
              />
            ) : undefined
          }>
          {showList ? (
            <>
              {loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={PURPLE} />
                  <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
              ) : requests.length ? (
                requests.map(request => (
                  <ExtraDayCard
                    key={request.id || `${request.date}-${request.requestBy}`}
                    request={request}
                    canUpdate={isApprovalMode}
                    updating={updatingId === request.id}
                    onAction={updateExtraDayStatus}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No extra day request found.</Text>
              )}

              {!isApprovalMode ? (
                <TouchableOpacity
                  activeOpacity={0.84}
                  style={styles.outlineButton}
                  onPress={() => setShowList(false)}>
                  <Text style={styles.outlineButtonText}>New Request</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#777"
                  style={styles.dateInput}
                />
              </View>

              <View style={styles.reasonInputBox}>
                <Text style={styles.inputLabel}>
                  Reason <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholderTextColor="#777"
                  multiline
                  textAlignVertical="top"
                  style={styles.reasonInput}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.84}
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.viewButton}
                onPress={openRequestList}>
                <Eye size={19} color="#0098EE" strokeWidth={2.3} />
                <Text style={styles.viewButtonText}>View Request List</Text>
              </TouchableOpacity>
            </>
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
    paddingBottom: 36,
  },
  formContent: {
    paddingTop: 26,
  },
  listContent: {
    paddingTop: 28,
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginHorizontal: 9,
    marginBottom: 18,
  },
  inputLabel: {
    color: TEXT,
    fontSize: 12,
    marginBottom: 1,
  },
  required: {
    color: RED,
  },
  dateInput: {
    height: 22,
    padding: 0,
    color: TEXT,
    fontSize: 14,
  },
  reasonInputBox: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 15,
    marginHorizontal: 9,
    marginBottom: 32,
  },
  reasonInput: {
    minHeight: 70,
    padding: 0,
    color: TEXT,
    fontSize: 14,
  },
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
    marginBottom: 20,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewButton: {
    height: 45,
    borderWidth: 1,
    borderColor: '#0098EE',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
  },
  viewButtonText: {
    color: '#0098EE',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 34,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  cardTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 72,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelPill: {
    backgroundColor: RED,
  },
  approvedPill: {
    backgroundColor: GREEN,
  },
  pendingPill: {
    backgroundColor: '#F5A623',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 17,
  },
  detailCell: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginLeft: 4,
  },
  value: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 16,
  },
  reasonBox: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 7,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 13,
  },
  reasonTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonText: {
    color: '#666A70',
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: GREEN,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: RED,
    marginLeft: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  centerBox: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#777',
    fontSize: 13,
    marginTop: 10,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    marginTop: 50,
    marginBottom: 22,
    textAlign: 'center',
  },
  outlineButton: {
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  outlineButtonText: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: '800',
  },
});
