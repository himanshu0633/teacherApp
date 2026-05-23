import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CircularCard, CircularHeader } from './CircularComponents';
import { circularStyles as styles } from './circularStyles';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

const readTeacherContext = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const [empCode, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);

  return {
    EmpCode: parsed?.EmpCode || empCode || '',
    BranchId: parsed?.BranchId || branchId || '',
    SessionId:
      parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  const rows =
    data?.data ||
    data?.Data ||
    data?.list ||
    data?.List ||
    data?.result ||
    data?.Result ||
    data?.circular ||
    data?.Circular ||
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response?.data ||
    data?.Response?.rest ||
    data?.Response?.Rest ||
    data?.Response?.Res ||
    data?.Response?.data ||
    [];

  if (Array.isArray(rows)) {
    return rows;
  }

  return rows ? [rows] : [];
};

const normalizeCircular = item => ({
  ...item,
  id: String(
    item?.id || item?.Id || item?.CircularId || item?.circular_id || '',
  ),
  title:
    item?.title ||
    item?.Title ||
    item?.CircularTitle ||
    item?.CircularName ||
    'Circular',
  date:
    item?.Created_Date || item?.date || item?.Date || item?.circular_date || '',
  by: item?.EmpName || item?.by || item?.CreatedBy || item?.TeacherName || '',
  unique_id: item?.unique_id || item?.UniqueId || item?.uniqueId || '',
  count: item?.count || item?.Count || '',
  attachment: item?.attachment || item?.Attachment || '',
  description: item?.description || item?.Description || '',
  file: item?.file || item?.File || '',
  pdf: item?.pdf || item?.Pdf || '',
  className: item?.ClassName || '',
  sectionName: item?.SectionName || '',
  studentType: item?.StudentType || '',
  groupName: item?.GroupName || '',
});

export default function SendByMeCircularListScreen({ navigation, route }) {
  const circularType = route?.params?.circularType || 'employee';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCirculars = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const context = await readTeacherContext();

      if (!context.EmpCode || !context.BranchId || !context.SessionId) {
        Alert.alert('Error', 'Employee, branch or session details not found.');
        return;
      }

      const isStudentCircular = circularType === 'student';
      const endpoint = isStudentCircular
        ? API_ENDPOINTS.STUDENT_CIRCULAR_SEND_BY_ME
        : API_ENDPOINTS.SEND_BY_ME_CIRCULAR_LIST;
      const payload = isStudentCircular
        ? {
            branch_id: context.BranchId,
            session_id: context.SessionId,
            EmpCode: context.EmpCode,
          }
        : {
            EmpCode: context.EmpCode,
            BranchId: context.BranchId,
            SessionId: context.SessionId,
          };

      const data = await postForm(endpoint, payload);

      console.log('SEND BY ME CIRCULAR LIST RESPONSE =>', data);
      setItems(
        getRows(data)
          .map(normalizeCircular)
          .filter(item => item.id),
      );
    } catch (error) {
      console.log('SEND BY ME CIRCULAR LIST ERROR =>', error);
      Alert.alert('Error', 'Failed to load send by me circular list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [circularType]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadCirculars());
    return unsubscribe;
  }, [loadCirculars, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCirculars(false);
  };

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title={
          circularType === 'student'
            ? 'Student Send By Me Circulars'
            : 'Send By Me Circulars'
        }
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color="#5A31C2" />
            </View>
          ) : items.length ? (
            items.map(item => (
              <CircularCard
                key={item.id}
                item={item}
                onPress={() =>
                  navigation.navigate('ViewCircularScreen', { circular: item })
                }
              />
            ))
          ) : (
            <View style={styles.centeredState}>
              <Text style={styles.stateText}>No circular found.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
