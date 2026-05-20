import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttachmentButton, CircularHeader } from './CircularComponents';
import { circularStyles as styles } from './circularStyles';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

const readSessionId = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const [sessionId, session] = await AsyncStorage.multiGet([
    'SessionId',
    'Session',
  ]);
  return (
    parsed?.SessionId || parsed?.Session || sessionId?.[1] || session?.[1] || ''
  );
};

const firstRow = data => {
  if (Array.isArray(data)) {
    return data[0] || {};
  }

  if (Array.isArray(data?.data)) {
    return data.data[0] || {};
  }

  if (Array.isArray(data?.Data)) {
    return data.Data[0] || {};
  }

  return data || {};
};

const rows = data => {
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

const normalizeDetail = (detail, fallback) => ({
  ...fallback,
  ...detail,
  id: String(detail?.id || detail?.Id || fallback?.id || ''),
  title: detail?.title || detail?.Title || fallback?.title || 'Circular',
  date:
    detail?.Created_Date ||
    detail?.date ||
    detail?.Date ||
    fallback?.date ||
    '',
  by: detail?.EmpName || detail?.by || detail?.CreatedBy || fallback?.by || '',
  employeeType:
    detail?.EmpCategory || detail?.employeeType || fallback?.employeeType || '',
  branch: detail?.BranchName || detail?.branch || fallback?.branch || '',
  description:
    detail?.description || detail?.Description || fallback?.description || '',
  file: detail?.file || detail?.File || fallback?.file || '',
  extraFile: detail?.ExtraFile || detail?.extraFile || '',
  unique_id: detail?.unique_id || detail?.UniqueId || fallback?.unique_id || '',
});

export default function ViewCircularScreen({ navigation, route }) {
  const routeParams = route?.params;
  const initialCircular = useMemo(
    () => routeParams?.circular || {},
    [routeParams?.circular],
  );
  const [circular, setCircular] = useState(initialCircular);
  const [readStatus, setReadStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('EMPLOYEE CIRCULAR VIEW ROUTE PARAMS =>', routeParams);
    console.log('EMPLOYEE CIRCULAR VIEW INITIAL =>', initialCircular);

    const loadDetail = async () => {
      if (!initialCircular?.id) {
        console.log('EMPLOYEE CIRCULAR DETAIL SKIPPED => missing circular id');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const sessionId = await readSessionId();
        console.log('EMPLOYEE CIRCULAR DETAIL SESSION ID =>', sessionId);

        if (!sessionId) {
          Alert.alert('Error', 'Session details not found.');
          return;
        }

        const detailPayload = {
          id: initialCircular.id,
          SessionId: sessionId,
        };
        console.log('EMPLOYEE CIRCULAR DETAIL PAYLOAD =>', detailPayload);

        const data = await postForm(
          API_ENDPOINTS.VIEW_CIRCULAR_STAFF,
          detailPayload,
        );

        console.log('EMPLOYEE CIRCULAR DETAIL RESPONSE =>', data);
        const detailRow = firstRow(data);
        console.log('EMPLOYEE CIRCULAR DETAIL FIRST ROW =>', detailRow);
        const nextCircular = normalizeDetail(detailRow, initialCircular);
        console.log('EMPLOYEE CIRCULAR DETAIL NORMALIZED =>', nextCircular);
        setCircular(nextCircular);

        if (nextCircular.unique_id) {
          const statusPayload = {
            unique_id: nextCircular.unique_id,
          };
          console.log(
            'EMPLOYEE CIRCULAR READ STATUS PAYLOAD =>',
            statusPayload,
          );
          const statusData = await postForm(
            API_ENDPOINTS.CIRCULAR_READ_STATUS,
            statusPayload,
          );
          console.log('EMPLOYEE CIRCULAR READ STATUS RESPONSE =>', statusData);
          setReadStatus(rows(statusData));
        } else {
          console.log(
            'EMPLOYEE CIRCULAR READ STATUS SKIPPED => unique_id missing',
            nextCircular,
          );
        }
      } catch (error) {
        console.log('EMPLOYEE CIRCULAR DETAIL ERROR =>', error);
  Alert.alert('Error', 'Failed to load circular details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [initialCircular, routeParams]);

  const openAttachment = async () => {
    const fileUrl = circular?.file || circular?.extraFile;
    console.log('CIRCULAR ATTACHMENT URL =>', fileUrl);

    if (!fileUrl) {
  Alert.alert('Info', 'No attachment available.');
      return;
    }

    try {
      await Linking.openURL(fileUrl);
    } catch (error) {
      console.log('CIRCULAR ATTACHMENT OPEN ERROR =>', error);
  Alert.alert('Error', 'Unable to open attachment.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="View Circular"
        onBack={() => navigation.goBack()}
        rightAction={() =>
          navigation.navigate('CircularReadStatusScreen', {
            unique_id: circular?.unique_id,
            readStatus,
          })
        }
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color="#5A31C2" />
            </View>
          ) : (
            <View style={styles.detailCard}>
              <View style={styles.cardTitleBar}>
                <Text style={styles.cardTitle}>{circular.title}</Text>
              </View>
              <View style={styles.detailBody}>
                <View style={styles.detailGrid}>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Circular Date</Text>
                    <Text style={styles.detailValue}>{circular.date}</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Circular By</Text>
                    <Text style={styles.detailValue}>{circular.by}</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Employee Type</Text>
                    <Text style={styles.detailValue}>
                      {circular.employeeType}
                    </Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Branch</Text>
                    <Text style={styles.detailValue}>{circular.branch}</Text>
                  </View>
                </View>

                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {circular.description || 'No description'}
                  </Text>
                </View>

                <AttachmentButton onPress={openAttachment} />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
