import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Mail, MessageSquareText, Phone, Search, UserRound} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const BLUE = '#0B96E8';
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
    data?.Res ||
    data?.result ||
    data?.Result ||
    data?.data ||
    data?.Data ||
    data?.response?.res ||
    data?.response?.Res ||
    [];

  return Array.isArray(rows) ? rows : [];
};

const getTeacherContext = async () => {
  const [saved, branchId, branchIdAlt, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('branchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);

  let parsed = {};

  try {
    parsed = saved ? JSON.parse(saved) : {};
  } catch (error) {
    parsed = {};
  }

  return {
    BranchId:
      parsed?.BranchId ||
      parsed?.branchId ||
      parsed?.branchid ||
      branchId ||
      branchIdAlt ||
      '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const normalizeSuggestion = item => ({
  id: firstValue(item, ['FeedbackId', 'feedbackId', 'id', 'Id'], ''),
  enrollNo: firstValue(item, ['EnrollNo', 'enrollNo', 'AdmissionNo']),
  feedback: firstValue(item, ['feedback', 'Feedback', 'suggestion', 'Suggestion']),
  phone: firstValue(item, ['phone', 'Phone', 'mobile', 'Mobile']),
  email: firstValue(item, ['email', 'Email']),
  relation: firstValue(item, ['relation', 'Relation'], ''),
  guardianName: firstValue(item, ['gurdianname', 'guardianName', 'GuardianName'], ''),
  reply: firstValue(item, ['Reply', 'reply'], ''),
  status: firstValue(item, ['Status', 'status'], ''),
});

function InfoLine({Icon, label, value}) {
  if (!value || value === '-') {
    return null;
  }

  return (
    <View style={styles.infoLine}>
      <Icon size={15} color="#686D75" strokeWidth={2} />
      <Text style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function SuggestionCard({item}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.enrollText}>Enroll No. {item.enrollNo}</Text>
        {item.status ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <InfoLine Icon={UserRound} label="Guardian" value={item.guardianName} />
        <InfoLine Icon={UserRound} label="Relation" value={item.relation} />
        <InfoLine Icon={Phone} label="Phone" value={item.phone} />
        <InfoLine Icon={Mail} label="Email" value={item.email} />

        <View style={styles.feedbackBox}>
          <View style={styles.feedbackTitleRow}>
            <MessageSquareText size={17} color={TEXT} strokeWidth={2} />
            <Text style={styles.feedbackTitle}>Suggestion</Text>
          </View>
          <Text style={styles.feedbackText}>{item.feedback}</Text>
        </View>

        {item.reply ? (
          <View style={styles.replyBox}>
            <Text style={styles.replyTitle}>Reply</Text>
            <Text style={styles.replyText}>{item.reply}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function SuggestionByParentsStudentsScreen({navigation}) {
  const [records, setRecords] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSuggestions = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const context = await getTeacherContext();

      if (!context.BranchId || !context.SessionId) {
        setRecords([]);
        Alert.alert('Error', 'Branch or session details not found.');
        return;
      }

      const payload = {
        BranchId: context.BranchId,
        SessionId: context.SessionId,
      };

      const data = await postForm(API_ENDPOINTS.GET_FEEDBACK, payload);
      console.log('SUGGESTION FEEDBACK PAYLOAD =>', payload);
      console.log('SUGGESTION FEEDBACK RESPONSE =>', data);
      setRecords(getRows(data).map(normalizeSuggestion).filter(item => item.id));
    } catch (error) {
      console.log('SUGGESTION FEEDBACK ERROR =>', error);
      setRecords([]);
      Alert.alert('Error', 'Suggestions could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const filteredRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter(item =>
      [
        item.enrollNo,
        item.feedback,
        item.phone,
        item.email,
        item.relation,
        item.guardianName,
        item.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [records, searchText]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Suggestion by Parents / Students"
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
              onRefresh={() => loadSuggestions(false)}
            />
          }>
          <View style={styles.searchBox}>
            <Search size={20} color="#676A70" strokeWidth={1.9} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search suggestion"
              placeholderTextColor="#686A70"
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading suggestions...</Text>
            </View>
          ) : filteredRecords.length ? (
            filteredRecords.map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>No suggestions found.</Text>
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
    minHeight: 42,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  enrollText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
  },
  statusPill: {
    minHeight: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  body: {
    padding: 15,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    color: '#626872',
    fontSize: 12.5,
    lineHeight: 17,
    marginLeft: 8,
  },
  infoLabel: {
    color: TEXT,
    fontWeight: '700',
  },
  feedbackBox: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 8,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 12,
    marginTop: 5,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackTitle: {
    color: TEXT,
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 7,
  },
  feedbackText: {
    color: '#555B65',
    fontSize: 13,
    lineHeight: 18,
  },
  replyBox: {
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
    backgroundColor: '#EEF8FE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  replyTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  replyText: {
    color: '#555B65',
    fontSize: 12.5,
    lineHeight: 17,
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
