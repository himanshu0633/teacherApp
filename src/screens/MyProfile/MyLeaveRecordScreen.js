import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {BASE_URL} from '../../utils/constants';

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

const getRecords = data => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.response?.rest || data?.rest || [];
};

export default function MyLeaveRecordScreen({navigation}) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const raw = await AsyncStorage.getItem('teacherData');
        const teacher = raw ? JSON.parse(raw) : {};
        const data = await postForm('leavelist.php', {
          EmpCode: teacher?.EmpCode,
        });

        setLeaves(getRecords(data));
      } catch (error) {
        console.log('LEAVE LIST ERROR =>', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  const approvedCount = leaves.filter(item =>
    String(item?.status || item?.Status || '')
      .toLowerCase()
      .includes('approved'),
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="My Leave Record" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Approved Leaves</Text>
            <Text style={styles.summaryValue}>{approvedCount}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#5A33C5" />
          ) : leaves.length === 0 ? (
            <Text style={styles.emptyText}>No leave record found</Text>
          ) : (
            leaves.map((item, index) => {
              const status = item?.status || item?.Status || '-';
              const approved = String(status).toLowerCase().includes('approved');

              return (
                <View key={index} style={styles.leaveCard}>
                  <View style={styles.leaveHeader}>
                    <Text style={styles.leaveTitle}>
                      {item?.LeaveType || item?.leaveType || item?.title || '-'}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        {backgroundColor: approved ? '#31B635' : '#F34D4D'},
                      ]}>
                      <Text style={styles.statusText}>{status}</Text>
                    </View>
                  </View>

                  <View style={styles.dateRow}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateLabel}>Date From:</Text>
                      <Text style={styles.dateValue}>
                        {item?.DateFrom || item?.datefrom || '-'}
                      </Text>
                    </View>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateLabel}>Date To:</Text>
                      <Text style={styles.dateValue}>
                        {item?.DateTo || item?.dateto || '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason for Leave:</Text>
                    <Text style={styles.reasonText}>
                      {item?.reason || item?.Reason || '-'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  content: {padding: 18},
  summaryCard: {
    borderWidth: 1,
    borderColor: '#C8DCEC',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 22,
    color: '#222',
  },
  leaveCard: {
    borderWidth: 1,
    borderColor: '#C8DCEC',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
  },
  leaveHeader: {
    backgroundColor: '#EAF4FB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTitle: {
    flex: 1,
    color: '#0E8DED',
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  dateBox: {
    width: '48%',
  },
  dateLabel: {
    color: '#777',
    fontSize: 13,
    marginBottom: 4,
  },
  dateValue: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  reasonBox: {
    margin: 14,
    padding: 14,
    backgroundColor: '#EAF4FB',
    borderRadius: 8,
  },
  reasonLabel: {
    color: '#333',
    fontSize: 13,
    marginBottom: 6,
  },
  reasonText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
