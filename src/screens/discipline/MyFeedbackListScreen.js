import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Frown, Smile} from 'lucide-react-native';
import DisciplineHeader from './DisciplineHeader';
import {BLUE, TEXT, disciplineStyles as baseStyles} from './DisciplineStyles';
import {StyleSheet} from 'react-native';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const safeGetItems = async keys => {
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return keys.reduce((acc, key, index) => {
    acc[key] = values[index] || '';
    return acc;
  }, {});
};

const getTeacherContext = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const stored = await safeGetItems([
    'EmpCode',
    'BranchId',
    'branchId',
    'branchid',
    'SessionId',
    'Session',
  ]);

  return {
    EmpCode: parsed?.EmpCode || stored.EmpCode || '',
    BranchId:
      parsed?.BranchId ||
      parsed?.branchId ||
      parsed?.branchid ||
      stored.BranchId ||
      stored.branchId ||
      stored.branchid ||
      '',
    SessionId:
      parsed?.SessionId ||
      parsed?.Session ||
      stored.SessionId ||
      stored.Session ||
      '',
  };
};

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.data ||
    data?.Data ||
    data?.list ||
    data?.List ||
    data?.result ||
    data?.Result ||
    data?.response?.Res ||
    data?.response?.res ||
    data?.Res ||
    data?.res ||
    data?.response?.data ||
    []
  );
};

const normalizeFeedback = item => ({
  id: String(item?.id || item?.Id || item?.ID || item?.EnrollNo || ''),
  name: item?.StudentName || item?.studentname || item?.Name || 'Student',
  date: item?.Created_Date || item?.CreatedDate || item?.date || '-',
  admissionNo: String(item?.EnrollNo || item?.AdmissionNo || item?.AdmNo || ''),
  className: item?.Class || item?.ClassName || '',
  section: item?.Section || item?.SectionName || '',
  mobileNo: String(item?.MobileNo || item?.Mobile || ''),
  remarks: item?.Parameter || item?.Remarks || item?.remarks || '-',
});

function TypeTab({active, label, Icon, onPress}) {
  return (
    <TouchableOpacity
      style={[styles.typeTab, active && styles.activeTypeTab]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Icon size={19} color={active ? '#FFFFFF' : TEXT} strokeWidth={2} />
      <Text style={[styles.typeTabText, active && styles.activeTypeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FeedbackCard({item}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.studentGrid}>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Admission No.</Text>
            <Text style={styles.studentValue}>{item.admissionNo}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Class</Text>
            <Text style={styles.studentValue}>{item.className}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Section</Text>
            <Text style={styles.studentValue}>{item.section}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Mobile No.</Text>
            <Text style={styles.studentValue}>{item.mobileNo || '-'}</Text>
          </View>
        </View>

        <View style={styles.remarksBox}>
          <Text style={styles.remarksTitle}>Remarks</Text>
          <Text style={styles.remarksText}>{item.remarks}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MyFeedbackListScreen({navigation}) {
  const [type, setType] = useState('Smiley');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeedback = useCallback(async selectedType => {
    const context = await getTeacherContext();

    if (!context.EmpCode || !context.SessionId || !context.BranchId) {
      setFeedbackItems([]);
      Alert.alert('Error', 'EmpCode, session or branch details not found.');
      return;
    }

    const payload = {
      EmpCode: context.EmpCode,
      Type: selectedType,
      SessionId: context.SessionId,
      BranchId: context.BranchId,
    };

    setLoading(true);
    try {
      console.log('MY FEEDBACK LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.SHOW_PARAMETER, payload);
      console.log('MY FEEDBACK LIST RESPONSE =>', data);
      const rows = getRows(data).map(normalizeFeedback).filter(item => item.id);
      setFeedbackItems(rows);
    } catch (error) {
      console.log('MY FEEDBACK LIST ERROR =>', error);
      setFeedbackItems([]);
      Alert.alert('Error', 'Failed to load feedback list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback(type);
  }, [loadFeedback, type]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedback(type);
    setRefreshing(false);
  };

  return (
    <View style={baseStyles.wrapper}>
      <DisciplineHeader
        title="My Feedback List"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={baseStyles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }>
          <View style={styles.tabs}>
            <TypeTab
              active={type === 'Smiley'}
              label="Smiley"
              Icon={Smile}
              onPress={() => setType('Smiley')}
            />
            <TypeTab
              active={type === 'Frowny'}
              label="Frowny"
              Icon={Frown}
              onPress={() => setType('Frowny')}
            />
          </View>

          {loading && !refreshing ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={BLUE} />
            </View>
          ) : feedbackItems.length ? (
            feedbackItems.map(item => (
              <FeedbackCard key={`${type}-${item.id}`} item={item} />
            ))
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>No {type} feedback found.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 36,
  },
  tabs: {
    flexDirection: 'row',
    gap: 13,
    paddingHorizontal: 23,
    marginBottom: 34,
  },
  typeTab: {
    flex: 1,
    height: 39,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  activeTypeTab: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  typeTabText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTypeTabText: {
    color: '#FFFFFF',
  },
  card: {
    borderWidth: 1,
    borderColor: '#B9DFF2',
    borderRadius: 7,
    backgroundColor: '#F1FBFF',
    marginBottom: 21,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E5EC',
    paddingLeft: 17,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  datePill: {
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 17,
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  studentCell: {
    width: '50%',
    marginBottom: 12,
  },
  studentLabel: {
    color: '#6F737B',
    fontSize: 12,
    marginBottom: 5,
  },
  studentValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  remarksBox: {
    minHeight: 64,
    borderRadius: 7,
    backgroundColor: '#D9EFFB',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  remarksTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  remarksText: {
    color: TEXT,
    fontSize: 12,
  },
  centerState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6F737B',
    fontSize: 13,
    fontWeight: '600',
  },
});
