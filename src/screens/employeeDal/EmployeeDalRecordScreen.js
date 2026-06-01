import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import {Eye, Link2, Plus, Search} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const BLUE = '#0B96E8';
const TEXT = '#202124';
const RED = '#FF0000';

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

const normalizeActivity = item => ({
  id: firstValue(item, ['id', 'Id', 'ID'], ''),
  name: firstValue(item, ['EmpName', 'empName', 'name']),
  empCode: firstValue(item, ['EmpCode', 'empCode']),
  date: firstValue(item, ['date', 'Date']),
  description: firstValue(item, ['description', 'Description']),
  attachment: firstValue(item, ['ExtraFile', 'extraFile', 'file', 'File'], ''),
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

function RecordCard({record}) {
  const handleAttachment = async () => {
    if (!record.attachment || record.attachment === '-') {
      Alert.alert('No File', 'Attachment is not available.');
      return;
    }

    try {
      await Linking.openURL(record.attachment);
    } catch (error) {
      console.log('DAL ATTACHMENT OPEN ERROR =>', error);
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

export default function EmployeeDalRecordScreen({navigation}) {
  const [date, setDate] = useState(todayText);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        EmpCode: context.EmpCode,
      };
      const data = await postForm(API_ENDPOINTS.DAILY_ACTIVITY_LOG, payload);
      console.log('DAILY ACTIVITY LOG PAYLOAD =>', payload);
      console.log('DAILY ACTIVITY LOG RESPONSE =>', data);
      setRecords(rows(data).map(normalizeActivity));
    } catch (error) {
      console.log('DAILY ACTIVITY LOG ERROR =>', error);
      Alert.alert('Error', 'Daily activity log could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  const pickFile = async () => {
    try {
      const [file] = await pick({
        type: [types.images, types.pdf, types.doc, types.docx],
        allowMultiSelection: false,
      });

      if (!file?.uri) {
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || 'daily-activity-file',
        type: file.type || 'application/octet-stream',
      });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      console.log('DAILY ACTIVITY FILE PICK ERROR =>', error);
      Alert.alert('Error', 'File selection failed.');
    }
  };

  const openActivityLog = () => {
    setShowList(true);
    loadRecords();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter description.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        description: description.trim(),
        EmpCode: context.EmpCode,
        BranchId: context.BranchId,
        SessionId: context.SessionId,
        ...(selectedFile ? {file: selectedFile} : {}),
      };
      const data = await postForm(API_ENDPOINTS.DAILY_ACTIVITY, payload);
      console.log('DAILY ACTIVITY PAYLOAD =>', payload);
      console.log('DAILY ACTIVITY RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'Daily activity submitted.');
        setDescription('');
        setSelectedFile(null);
        setShowList(true);
        await loadRecords();
        return;
      }

      Alert.alert('Error', data?.msg || data?.message || 'Daily activity could not be submitted.');
    } catch (error) {
      console.log('DAILY ACTIVITY ERROR =>', error);
      Alert.alert('Error', 'Daily activity could not be submitted.');
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
        title={showList ? 'My DAL Record' : 'Daily Activity Log'}
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {showList ? (
            <>
              <View style={styles.searchRow}>
                <View style={styles.filterBox}>
                  <Text style={styles.filterText}>Year <Text style={styles.required}>*</Text></Text>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterText}>Month <Text style={styles.required}>*</Text></Text>
                </View>
                <TouchableOpacity activeOpacity={0.84} style={styles.searchButton} onPress={loadRecords}>
                  <Search size={25} color="#fff" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={PURPLE} />
                  <Text style={styles.loadingText}>Loading records...</Text>
                </View>
              ) : records.length ? (
                records.map(record => (
                  <RecordCard key={record.id || `${record.date}-${record.description}`} record={record} />
                ))
              ) : (
                <Text style={styles.emptyText}>No records found</Text>
              )}

              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.outlineButton}
                onPress={() => setShowList(false)}>
                <Text style={styles.outlineButtonText}>New Log</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>
                  Date<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#777"
                  style={styles.dateInput}
                />
              </View>

              <View style={styles.descriptionInputBox}>
                <Text style={styles.inputLabel}>
                  Description <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="write here..."
                  placeholderTextColor="#777"
                  multiline
                  textAlignVertical="top"
                  style={styles.descriptionInput}
                />
              </View>

              <TouchableOpacity activeOpacity={0.84} style={styles.uploadBox} onPress={pickFile}>
                <Text style={styles.uploadText} numberOfLines={1}>
                  {selectedFile?.name || 'Upload doc/image'}
                </Text>
                <View style={styles.plusBox}>
                  <Plus size={35} color={RED} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.84}
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit Log</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.84} style={styles.viewButton} onPress={openActivityLog}>
                <Eye size={19} color="#0098EE" strokeWidth={2.3} />
                <Text style={styles.viewButtonText}>View Activity Log</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  formContent: {
    paddingTop: 35,
  },
  listContent: {
    paddingTop: 19,
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 14,
  },
  inputLabel: {
    color: '#6D7179',
    fontSize: 11,
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
  descriptionInputBox: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 10,
    marginHorizontal: 8,
    marginBottom: 17,
  },
  descriptionInput: {
    minHeight: 66,
    padding: 0,
    color: TEXT,
    fontSize: 14,
  },
  uploadBox: {
    height: 78,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 24,
    marginHorizontal: 8,
    marginBottom: 46,
  },
  uploadText: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    marginRight: 14,
  },
  plusBox: {
    width: 62,
    height: 58,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: RED,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
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
    marginHorizontal: 8,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
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
  searchButton: {
    width: 58,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#EF27A8',
    alignItems: 'center',
    justifyContent: 'center',
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
