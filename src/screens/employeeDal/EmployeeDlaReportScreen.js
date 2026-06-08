import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import {Link2, Search} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const BLUE = '#0B96E8';
const TEXT = '#202124';
const RED = '#FF0000';

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

const normalizeActivity = item => ({
  id: firstValue(item, ['id', 'Id', 'ID'], ''),
  name: firstValue(item, ['EmpName', 'empName', 'name', 'Name']),
  empCode: firstValue(item, ['EmpCode', 'empCode', 'Empcode']),
  date: firstValue(item, ['date', 'Date']),
  description: firstValue(item, ['description', 'Description']),
  attachment: firstValue(item, ['ExtraFile', 'extraFile', 'file', 'File'], ''),
});

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

function RecordCard({record}) {
  const handleAttachment = async () => {
    if (!record.attachment || record.attachment === '-') {
      Alert.alert('No File', 'Attachment is not available.');
      return;
    }

    try {
      await Linking.openURL(record.attachment);
    } catch (error) {
      console.log('EMPLOYEE DLA ATTACHMENT OPEN ERROR =>', error);
      Alert.alert('Error', 'Attachment could not be opened.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>Date: {record.date}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{record.name}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Emp Code</Text>
          <Text style={styles.value}>{record.empCode}</Text>
        </View>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{record.description}</Text>
      </View>

      {record.attachment && record.attachment !== '-' ? (
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.attachmentRow}
          onPress={handleAttachment}>
          <View style={styles.attachmentIcon}>
            <Link2 size={20} color="#222" strokeWidth={2.1} />
          </View>
          <Text style={styles.attachmentText}>View Attachment</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function EmployeeDlaReportScreen({navigation}) {
  const [records, setRecords] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecords = useCallback(async (showLoader = true) => {
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
        BranchId: context.BranchId,
        SessionId: context.SessionId,
      };
      const data = await postForm(
        API_ENDPOINTS.DAILY_ACTIVITY_LOG_EMPLOYEES,
        payload,
      );
      console.log('EMPLOYEE DLA REPORT PAYLOAD =>', payload);
      console.log('EMPLOYEE DLA REPORT RESPONSE =>', data);
      setRecords(rows(data).map(normalizeActivity));
    } catch (error) {
      console.log('EMPLOYEE DLA REPORT ERROR =>', error);
      Alert.alert('Error', 'Employee DLA report could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRecords = records.filter(record => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      record.name.toLowerCase().includes(normalizedSearch) ||
      record.empCode.toLowerCase().includes(normalizedSearch) ||
      record.date.toLowerCase().includes(normalizedSearch) ||
      record.description.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Employee DLA Report"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={PURPLE}
              colors={[PURPLE]}
              onRefresh={() => loadRecords(false)}
            />
          }>
          <View style={styles.searchRow}>
            <View style={styles.filterBox}>
              <Text style={styles.filterText}>
                Year <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <View style={styles.filterBox}>
              <Text style={styles.filterText}>
                Month <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.84}
              style={styles.searchButton}
              onPress={() => loadRecords()}>
              <Search size={25} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Search size={20} color="#676A70" strokeWidth={1.9} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search employee or date"
              placeholderTextColor="#686A70"
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : filteredRecords.length ? (
            filteredRecords.map(record => (
              <RecordCard
                key={record.id || `${record.empCode}-${record.date}-${record.description}`}
                record={record}
              />
            ))
          ) : (
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
    paddingTop: 19,
    paddingBottom: 36,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  filterBox: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  filterText: {
    color: TEXT,
    fontSize: 14,
  },
  required: {
    color: RED,
  },
  searchButton: {
    width: 58,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#EF27A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 45,
    borderRadius: 7,
    backgroundColor: '#F1F1F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 0,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardTop: {
    minHeight: 34,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  datePill: {
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 18,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 5,
  },
  value: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionBox: {
    minHeight: 77,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 8,
    backgroundColor: '#F4F4F6',
    marginHorizontal: 15,
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 12,
    marginBottom: 15,
  },
  descriptionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  descriptionText: {
    color: '#666A70',
    fontSize: 12,
    lineHeight: 16,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 16,
  },
  attachmentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  attachmentText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
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
    color: '#6D7179',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
});
