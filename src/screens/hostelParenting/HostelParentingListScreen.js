import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const normalizeRemark = item => ({
  empName: item?.EmpName || '-',
  description: item?.Description || item?.description || '-',
  studentName: item?.StudentName || '-',
  enrollNo: item?.EnrollNo || '-',
  className: item?.ClassName || '-',
  sectionName: item?.SectionName || '-',
  rollNo: item?.RollNo || item?.rollNo || '-',
  date: item?.date || item?.Date || '-',
});

export default function HostelParentingListScreen({navigation}) {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRemarks = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
      };

      console.log('HOSTEL PARENTING LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SHOW_HOSTEL_PARENTING, payload);
      console.log('HOSTEL PARENTING LIST RESPONSE =>', data);

      if (String(data?.status || '').toLowerCase() === 'success') {
        setRemarks(rows(data).map(normalizeRemark));
        return;
      }

      setRemarks([]);
    } catch (error) {
      console.log('HOSTEL PARENTING LIST ERROR =>', error);
      Alert.alert('Error', 'Hostel parenting list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRemarks);
    return unsubscribe;
  }, [loadRemarks, navigation]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Hostel Parenting"
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
          ) : remarks.length ? (
            remarks.map((item, index) => (
              <RemarkCard key={`${item.enrollNo}-${item.date}-${index}`} item={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>No hostel parenting data found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function RemarkCard({item}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.dateText}>Date: {item.date}</Text>
      </View>

      <View style={styles.details}>
        <Info label="Admission No" value={item.enrollNo} />
        <Info label="Class" value={item.className} />
        <Info label="Section" value={item.sectionName} />
        <Info label="Roll No." value={item.rollNo} />
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
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
    paddingBottom: 20,
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardHead: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  studentName: {fontSize: 14, color: TEXT, fontWeight: '800', textAlign: 'center'},
  dateText: {fontSize: 12, color: '#0098EE', fontWeight: '700', marginTop: 2},
  details: {paddingHorizontal: 16, paddingTop: 15, paddingBottom: 10},
  infoRow: {flexDirection: 'row', marginBottom: 12},
  infoLabel: {width: '50%', color: TEXT, fontSize: 13, fontWeight: '800'},
  infoValue: {flex: 1, color: '#777', fontSize: 13},
  descriptionBox: {
    minHeight: 70,
    borderRadius: 7,
    backgroundColor: '#DDF2FF',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descriptionTitle: {fontSize: 12, color: TEXT, fontWeight: '800', marginBottom: 7},
  descriptionText: {fontSize: 12, color: TEXT, lineHeight: 18},
});
