import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Pencil} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const TEXT = '#252525';

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
  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.res ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const firstValue = (source, keys, fallback = '-') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const normalizeAllocation = item => ({
  id: firstValue(item, ['Id', 'ID', 'AllocationId', 'allocationid'], ''),
  studentName: firstValue(item, ['StudentName', 'Name', 'stname']),
  className: firstValue(item, ['Class', 'ClassName', 'classname']),
  enrollNo: firstValue(item, ['EnrollNo', 'AdmissionNo', 'AdmNo', 'adminno']),
  date: firstValue(item, ['AllocationDate', 'DateOfAllocation', 'date', 'Date']),
  hostel: firstValue(item, ['HostelName', 'Hostel', 'hostel']),
  room: firstValue(item, ['RoomNo', 'Room', 'RoomName', 'room']),
  floor: firstValue(item, ['FloorName', 'Floor', 'floor']),
  status: firstValue(item, ['Status', 'status'], 'Active'),
});

export default function HostelParentingListScreen({navigation}) {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
      };

      console.log('HOSTEL ROOM ALLOCATION LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SHOW_HOSTEL_ROOM_ALLOCATION, payload);
      console.log('HOSTEL ROOM ALLOCATION LIST RESPONSE =>', data);

      if (data?.status === true || String(data?.status || '').toLowerCase() === 'true') {
        setAllocations(rows(data).map(normalizeAllocation));
        return;
      }

      setAllocations([]);
    } catch (error) {
      console.log('HOSTEL ROOM ALLOCATION LIST ERROR =>', error);
      Alert.alert('Error', 'Hostel room allocation list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadAllocations);
    return unsubscribe;
  }, [loadAllocations, navigation]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Hostel Room Allocation"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : allocations.length ? (
            allocations.map((item, index) => (
              <AllocationCard
                key={`${item.id || item.enrollNo}-${index}`}
                item={item}
                onEdit={() => navigation.navigate('HostelParentingScreen', {allocation: item})}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hostel room allocation data found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AllocationCard({item, onEdit}) {
  const active = String(item.status || '').toLowerCase() !== 'inactive';
  const titleBits = [item.studentName, item.className !== '-' ? item.className : '']
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.studentName}>{titleBits || '-'}</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={onEdit} style={styles.editButton}>
          <Pencil size={19} color="#0098EE" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Info label="Admission No" value={item.enrollNo} />
        <Info label="Date of Allocation" value={item.date} />
        <Info label="Hostel" value={item.hostel} />
        <Info label="Room No." value={item.room} />
        <Info label="Floor" value={item.floor} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}>
            <Text style={styles.statusText}>{active ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32},
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 10, color: '#777', fontSize: 13},
  emptyText: {marginTop: 50, textAlign: 'center', color: '#777', fontSize: 14},
  card: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C8E4F4',
    backgroundColor: '#EFFAFF',
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardHead: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {flex: 1, fontSize: 14, color: TEXT, fontWeight: '800'},
  editButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {paddingHorizontal: 16, paddingTop: 17, paddingBottom: 16},
  infoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  infoLabel: {width: '50%', color: TEXT, fontSize: 14, fontWeight: '800'},
  infoValue: {flex: 1, color: '#777', fontSize: 14},
  statusPill: {
    minWidth: 72,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  activePill: {backgroundColor: '#26B72C'},
  inactivePill: {backgroundColor: '#FF4B4B'},
  statusText: {color: '#fff', fontSize: 10, fontWeight: '700'},
});
