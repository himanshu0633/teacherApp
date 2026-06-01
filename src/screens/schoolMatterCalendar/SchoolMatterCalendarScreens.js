import React, {useCallback, useEffect, useState} from 'react';
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
import {
  CalendarDays,
  CheckSquare,
  HelpCircle,
  ListChecks,
  UserRound,
} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const BLUE = '#079CEF';
const RED = '#FF4B4B';
const GREEN = '#25B83D';
const CARD_BLUE = '#EFFAFF';
const TEXT = '#252525';

const filters = [
  {label: 'All', key: 'all', color: BLUE, Icon: ListChecks},
  {label: 'Monthly', key: 'Monthly', color: PURPLE, Icon: CalendarDays},
  {label: 'Pending', key: 'pending', color: RED, Icon: HelpCircle},
  {label: 'Completed', key: 'completed', color: GREEN, Icon: CheckSquare},
];

const getTeacherContext = async () => {
  const [saved, branchId, sessionId, session, empCode, enrollNo] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('EnrollNo'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
    EnrollNo: parsed?.EnrollNo || parsed?.enroll_no || parsed?.enrollNo || enrollNo || '',
  };
};

const rows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.task_details) {
    return [data.task_details];
  }

  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response ||
    data?.all_data ||
    data?.task_list ||
    data?.tasks ||
    data?.rest ||
    data?.Rest ||
    data?.Res ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const getStatusKey = status => {
  const value = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (value === 'complete' || value === 'completed') {
    return 'completed';
  }

  return 'pending';
};

const normalizeTask = item => ({
  id: String(item?.id || item?.Id || item?.ID || ''),
  staffId: String(item?.staff_id || item?.staffId || item?.EmpCode || item?.empcode || ''),
  status: item?.Activity_status || item?.activity_status || item?.status || 'Pending',
  date: item?.activity_date || item?.ActivityDate || item?.date || '-',
  assignedTo:
    item?.staff_resposive ||
    item?.staff_responsive ||
    item?.staff_name ||
    item?.assigned_to ||
    '-',
  activity: item?.activity || item?.Activity || item?.description || '-',
});

const formatMonthTitle = value => {
  const raw = String(value || '');
  const parsed = Date.parse(raw.replace(/-/g, ' '));

  if (Number.isNaN(parsed)) {
    return '';
  }

  return new Date(parsed).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
};

const success = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

export function SchoolMatterCalendarScreen({navigation}) {
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const monthTitle = formatMonthTitle(tasks[0]?.date);

  const openTask = useCallback(
    async task => {
      if (getStatusKey(task.status) === 'completed') {
        return;
      }

      const context = await getTeacherContext();
      const loggedUserId = String(context.EnrollNo || context.EmpCode || '').trim();
      const taskStaffId = String(task.staffId || '').trim();

      if (taskStaffId && loggedUserId && taskStaffId !== loggedUserId) {
        Alert.alert('Not authorized', 'You are not authorized to open this task.');
        return;
      }

      navigation.navigate('SchoolMatterTaskDetailScreen', {
        id: task.id,
      });
    },
    [navigation],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        empcode: context.EmpCode,
      };

      if (activeFilter !== 'all') {
        payload.status =
          activeFilter === 'completed' || activeFilter === 'pending'
            ? filters.find(item => item.key === activeFilter)?.label
            : activeFilter;
      }

      console.log('SCHOOL TASK LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SCHOOL_MASTER_CALENDAR, payload);
      console.log('SCHOOL TASK LIST RESPONSE =>', data);

      if (success(data)) {
        setTasks(rows(data).map(normalizeTask).filter(item => item.id));
        return;
      }

      setTasks([]);
    } catch (error) {
      console.log('SCHOOL TASK LIST ERROR =>', error);
      Alert.alert('Error', 'School task list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTasks);
    return unsubscribe;
  }, [loadTasks, navigation]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="School Matter Calendar"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.listContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            {filters.map(item => (
              <FilterButton
                key={item.key}
                item={item}
                active={activeFilter === item.key}
                onPress={() => setActiveFilter(item.key)}
              />
            ))}
          </ScrollView>

          {monthTitle ? <Text style={styles.monthText}>{monthTitle}</Text> : null}

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : tasks.length ? (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => openTask(task)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No school tasks found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function SchoolMatterTaskDetailScreen({navigation, route}) {
  const taskId = String(route?.params?.id || '');
  const [task, setTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      return;
    }

    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        id: taskId,
        Emp_code: context.EmpCode,
      };

      console.log('SCHOOL TASK DETAIL PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SCHOOL_TASK_ASSIGN, payload);
      console.log('SCHOOL TASK DETAIL RESPONSE =>', data);

      if (success(data)) {
        const [nextTask] = rows(data).map(normalizeTask);
        setTask(nextTask || null);
        setStatus(getStatusKey(nextTask?.status) === 'completed' ? 'Completed' : 'Pending');
        return;
      }

      setTask(null);
    } catch (error) {
      console.log('SCHOOL TASK DETAIL ERROR =>', error);
      Alert.alert('Error', 'School task details could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleSubmit = async () => {
    if (!task?.id) {
      Alert.alert('Error', 'Task id not found.');
      return;
    }

    if (!remarks.trim()) {
      Alert.alert('Required', 'Please enter remarks/comment.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        id: task.id,
        empcode: context.EmpCode,
        Activity_status: status,
        rem_comm: remarks.trim(),
      };

      console.log('SCHOOL TASK UPDATE PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SCHOOL_TASK_UPDATE, payload);
      console.log('SCHOOL TASK UPDATE RESPONSE =>', data);

      if (success(data)) {
        Alert.alert('Success', data?.message || data?.msg || 'Task updated.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Task could not be updated.');
    } catch (error) {
      console.log('SCHOOL TASK UPDATE ERROR =>', error);
      Alert.alert('Error', 'Task could not be updated.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="School Matter Calendar"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.detailContent}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading task...</Text>
            </View>
          ) : task ? (
            <>
              <Text style={styles.detailTitle}>Task Assigned to Me</Text>
              <Text style={styles.detailDate}>{task.date}</Text>

              <TaskCard task={task} compact />

              <View style={styles.remarksBox}>
                <Text style={styles.floatLabel}>
                  Remarks/Comment <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="write here..."
                  placeholderTextColor={TEXT}
                  multiline
                  textAlignVertical="top"
                  style={styles.remarksInput}
                />
              </View>

              <View style={styles.radioRow}>
                <RadioOption
                  label="Pending"
                  selected={status === 'Pending'}
                  onPress={() => setStatus('Pending')}
                />
                <RadioOption
                  label="Request for Completion"
                  selected={status === 'Completed'}
                  onPress={() => setStatus('Completed')}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.submitButton, submitting && styles.disabledButton]}
                disabled={submitting}
                onPress={handleSubmit}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.emptyText}>Task details not found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FilterButton({item, active, onPress}) {
  const Icon = item.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.filterButton,
        {backgroundColor: item.color},
        active && styles.activeFilter,
      ]}
      onPress={onPress}>
      <Icon size={20} color="#fff" strokeWidth={2.2} />
      <Text style={styles.filterText}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function TaskCard({task, compact = false, onPress}) {
  const completed = getStatusKey(task.status) === 'completed';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.84 : 1}
      disabled={!onPress}
      style={[styles.taskCard, compact && styles.compactTaskCard]}
      onPress={onPress}>
      <View style={styles.cardHead}>
        <Text style={styles.cardHeadText}>Activity Detail</Text>
        <View
          style={[
            styles.statusPill,
            completed ? styles.completedPill : styles.pendingPill,
          ]}>
          <Text style={styles.statusText}>
            {completed ? 'Completed' : task.status || 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.taskBody}>
        <View style={styles.infoGrid}>
          <InfoPair label="Date of Activity" value={task.date} Icon={CalendarDays} />
          <InfoPair label="Assigned To" value={task.assignedTo} Icon={UserRound} />
        </View>

        <View style={styles.activityBox}>
          <Text style={styles.activityTitle}>Name of the Activity</Text>
          <Text style={styles.activityText}>{task.activity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function InfoPair({label, value, Icon}) {
  return (
    <View style={styles.infoPair}>
      <View style={styles.infoLabelRow}>
        <Icon size={13} color="#35B64B" strokeWidth={2} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function RadioOption({label, selected, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.radioItem}
      onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  listContent: {paddingHorizontal: 19, paddingTop: 24, paddingBottom: 32},
  detailContent: {flexGrow: 1, paddingHorizontal: 19, paddingTop: 36, paddingBottom: 32},
  filterRow: {gap: 7, paddingBottom: 22},
  filterButton: {
    height: 40,
    borderRadius: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeFilter: {borderColor: '#222'},
  filterText: {color: '#fff', fontSize: 14, fontWeight: '800'},
  monthText: {fontSize: 16, color: TEXT, fontWeight: '800', marginBottom: 12},
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 10, color: '#777', fontSize: 13},
  emptyText: {marginTop: 55, color: '#777', fontSize: 14, textAlign: 'center'},
  taskCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C8E4F4',
    backgroundColor: CARD_BLUE,
    marginBottom: 14,
    overflow: 'hidden',
  },
  compactTaskCard: {marginBottom: 14},
  cardHead: {
    minHeight: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeadText: {fontSize: 13, color: TEXT, fontWeight: '800'},
  statusPill: {
    minWidth: 72,
    minHeight: 21,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  pendingPill: {backgroundColor: RED},
  completedPill: {backgroundColor: GREEN},
  statusText: {fontSize: 10, color: '#fff'},
  taskBody: {paddingHorizontal: 15, paddingTop: 16, paddingBottom: 17},
  infoGrid: {flexDirection: 'row'},
  infoPair: {width: '50%', marginBottom: 13},
  infoLabelRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  infoLabel: {fontSize: 12, color: '#777', marginLeft: 4},
  infoValue: {fontSize: 13, color: TEXT, fontWeight: '800'},
  activityBox: {
    minHeight: 70,
    borderRadius: 7,
    backgroundColor: '#DDF2FF',
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  activityTitle: {fontSize: 12, color: TEXT, fontWeight: '800', marginBottom: 7},
  activityText: {fontSize: 12, color: TEXT, lineHeight: 18},
  detailTitle: {fontSize: 16, color: TEXT, fontWeight: '900', textAlign: 'center'},
  detailDate: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  remarksBox: {
    minHeight: 112,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 15,
    paddingTop: 10,
    marginBottom: 22,
  },
  floatLabel: {fontSize: 10, color: '#777'},
  required: {color: 'red'},
  remarksInput: {
    minHeight: 82,
    padding: 0,
    marginTop: 4,
    color: TEXT,
    fontSize: 14,
  },
  radioRow: {flexDirection: 'row', alignItems: 'center', gap: 22, marginBottom: 28},
  radioItem: {flexDirection: 'row', alignItems: 'center'},
  radioOuter: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  radioOuterActive: {borderColor: PURPLE},
  radioDot: {width: 9, height: 9, borderRadius: 5, backgroundColor: PURPLE},
  radioText: {fontSize: 14, color: TEXT},
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  disabledButton: {opacity: 0.65},
  submitText: {fontSize: 16, color: '#fff', fontWeight: '800'},
});
