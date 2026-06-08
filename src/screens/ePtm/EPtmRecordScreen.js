import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Search} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const TEXT = '#202124';
const BLUE = '#0798EA';

const normalizeRecord = (item, index) => ({
  id: String(item?.id || item?.RollNo || item?.EnrollNo || index),
  calledBy: item?.CalledBy || item?.calledBy || '',
  empCode: item?.EmpCode || item?.empCode || '',
  date: item?.date || item?.Date || '-',
  student: item?.StudentName || item?.student || '-',
  admissionNo: item?.EnrollNo || item?.AdmissionNo || '-',
  rollNo: item?.RollNo || item?.rollNo || '-',
  className: item?.ClassName || '-',
  mobileNo: item?.Mobile || item?.MobileNo || '-',
  talkWith: item?.TalkWith || '-',
  mode: item?.mode || item?.Mode || '-',
  satisfaction: item?.psat || item?.satisfaction || '-',
  area: item?.area || '-',
  description: item?.Description || item?.description || '-',
});

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.rest ||
    data?.Res ||
    data?.data ||
    []
  );
};

function DetailRow({label, value}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function PtmRecordCard({record}) {
  const headerTitle =
    record.calledBy || record.empCode
      ? `Called By: ${record.calledBy || '-'} (${record.empCode || '-'})`
      : `${record.student} (${record.className})`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.calledText}>{headerTitle}</Text>
        <Text style={styles.dateText}>Date: {record.date}</Text>
      </View>

      <View style={styles.cardBody}>
        <DetailRow label="Student" value={record.student} />
        <DetailRow label="Admission No" value={record.admissionNo} />
        <DetailRow label="Roll No" value={record.rollNo} />
        <DetailRow label="Class" value={record.className} />
        <DetailRow label="Mobile No" value={record.mobileNo} />
        <DetailRow label="Talk With" value={record.talkWith} />
        <DetailRow label="Mode" value={record.mode} />
        <DetailRow label="P-Satisfaction" value={record.satisfaction} />
        <DetailRow label="Area" value={record.area} />

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{record.description}</Text>
        </View>
      </View>
    </View>
  );
}

export default function EPtmRecordScreen({navigation, route}) {
  const [searchText, setSearchText] = useState('');
  const [records, setRecords] = useState(route?.params?.records || []);
  const [loading, setLoading] = useState(false);
  const ptmRecords = records.map(normalizeRecord);
  const normalizedSearch = searchText.trim().toLowerCase();

  useEffect(() => {
    if (route?.params?.records) {
      setRecords(route.params.records);
      return;
    }

    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await postForm(API_ENDPOINTS.SHOW_PTM_ALL, {});
        console.log('E-PTM ALL RECORD RESPONSE =>', data);
        setRecords(getRows(data));
      } catch (error) {
        console.log('E-PTM RECORD SCREEN ERROR =>', error);
        Alert.alert('Error', 'Failed to load PTM records.');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [route?.params?.records]);
  const filteredRecords = ptmRecords.filter(record => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      record.student.toLowerCase().includes(normalizedSearch) ||
      record.admissionNo.toLowerCase().includes(normalizedSearch) ||
      record.rollNo.toLowerCase().includes(normalizedSearch) ||
      record.className.toLowerCase().includes(normalizedSearch) ||
      record.calledBy.toLowerCase().includes(normalizedSearch) ||
      record.empCode.toLowerCase().includes(normalizedSearch) ||
      record.talkWith.toLowerCase().includes(normalizedSearch) ||
      record.mobileNo.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="E-PTM Record"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>List of Records</Text>

          <View style={styles.searchBox}>
            <Search size={23} color="#676A70" strokeWidth={1.9} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Enter Name or ID"
              placeholderTextColor="#686A70"
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={BLUE} />
            </View>
          ) : (
            filteredRecords.map(record => (
              <PtmRecordCard key={record.id} record={record} />
            ))
          )}

          {!loading && filteredRecords.length === 0 && (
            <Text style={styles.emptyText}>No records found</Text>
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  heading: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 13,
  },
  searchBox: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F1F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    marginLeft: 12,
    paddingVertical: 0,
  },
  card: {
    borderWidth: 1,
    borderColor: '#B9E0F2',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 47,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E4EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  calledText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  dateText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 17,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    width: 160,
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    color: '#666A70',
    fontSize: 14,
  },
  descriptionBox: {
    minHeight: 69,
    borderRadius: 7,
    backgroundColor: '#DDF1FC',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 8,
  },
  descriptionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    color: TEXT,
    fontSize: 11,
    lineHeight: 15,
  },
  emptyText: {
    color: '#6D7179',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingBox: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
