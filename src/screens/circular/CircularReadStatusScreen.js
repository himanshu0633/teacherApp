import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { CircularHeader } from './CircularComponents';
import { circularStyles as styles } from './circularStyles';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

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
    []
  );
};

const normalizeStatus = (item, index) => {
  const statusText = String(
    item?.status || item?.Status || item?.read_status || item?.ReadStatus || '',
  ).toLowerCase();
  const read =
    item?.read === true ||
    item?.IsRead === true ||
    item?.is_read === '1' ||
    item?.read_status === '1' ||
    statusText === 'read' ||
    statusText === 'true';

  return {
    id: String(item?.id || item?.EmpCode || index),
    name:
      item?.EmpName ||
      item?.name ||
      item?.Name ||
      item?.StaffName ||
      'Employee',
    code: item?.EmpCode || item?.code || item?.Code || '',
    read,
  };
};

export default function CircularReadStatusScreen({ navigation, route }) {
  const uniqueId = route?.params?.unique_id;
  const initialRows = route?.params?.readStatus || [];
  const [statusRows, setStatusRows] = useState(
    initialRows.map(normalizeStatus),
  );
  const [loading, setLoading] = useState(!initialRows.length && !!uniqueId);

  useEffect(() => {
    const loadStatus = async () => {
      if (!uniqueId || initialRows.length) {
        return;
      }

      setLoading(true);
      try {
        const data = await postForm(API_ENDPOINTS.CIRCULAR_READ_STATUS, {
          unique_id: uniqueId,
        });
        console.log('CIRCULAR READ STATUS RESPONSE =>', data);
        setStatusRows(getRows(data).map(normalizeStatus));
      } catch (error) {
        console.log('CIRCULAR READ STATUS ERROR =>', error);
  Alert.alert('Error', 'Failed to load read status.');
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [initialRows.length, uniqueId]);

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="Circular Read Status"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.statusContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusCard}>
            {loading ? (
              <View style={styles.centeredState}>
                <ActivityIndicator color="#5A31C2" />
              </View>
            ) : statusRows.length ? (
              statusRows.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.statusRow,
                    index === statusRows.length - 1 && styles.lastStatusRow,
                  ]}
                >
                  <View>
                    <Text style={styles.personName}>{item.name}</Text>
                    <Text style={styles.personCode}>
                      Emp Code - {item.code}
                    </Text>
                  </View>
                  <View style={styles.readBadge}>
                    <View
                      style={[
                        styles.readDot,
                        item.read ? styles.readDotRead : styles.readDotUnread,
                      ]}
                    />
                    <Text
                      style={[
                        styles.readText,
                        item.read ? styles.readTextRead : styles.readTextUnread,
                      ]}
                    >
                      {item.read ? 'Read' : 'Unread'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.centeredState}>
                <Text style={styles.stateText}>No read status found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
