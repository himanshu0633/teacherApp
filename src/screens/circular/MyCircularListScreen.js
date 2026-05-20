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
import {
  CircularCard,
  CircularHeader,
  CircularTabs,
} from './CircularComponents';
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

  const [empCode, branchId, sessionId, session] = await AsyncStorage.multiGet([
    'EmpCode',
    'BranchId',
    'SessionId',
    'Session',
  ]);

  return {
    EmpCode: parsed?.EmpCode || empCode?.[1] || '',
    BranchId: parsed?.BranchId || branchId?.[1] || '',
    SessionId:
      parsed?.SessionId ||
      parsed?.Session ||
      sessionId?.[1] ||
      session?.[1] ||
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
    data?.circular ||
    data?.Circular ||
    []
  );
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
});

export default function MyCircularListScreen({ navigation }) {
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

      const data = await postForm(API_ENDPOINTS.SEND_BY_ME_CIRCULAR_LIST, {
        EmpCode: context.EmpCode,
        BranchId: context.BranchId,
        SessionId: context.SessionId,
      });

      console.log('EMPLOYEE CIRCULAR LIST RESPONSE =>', data);
      setItems(
        getRows(data)
          .map(normalizeCircular)
          .filter(item => item.id),
      );
    } catch (error) {
      console.log('EMPLOYEE CIRCULAR LIST ERROR =>', error);
      Alert.alert('Error', 'Circular list load nahi ho payi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
        title="My Circular List"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <CircularTabs
          active="list"
          onCreate={() => navigation.navigate('EmployeeCircularScreen')}
          onList={() => {}}
        />

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
