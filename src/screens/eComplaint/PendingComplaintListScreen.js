import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import {ComplaintCard} from './ComplaintListComponents';
import {fetchPendingComplaints, getTeacherContext} from './complaintApi';

const PURPLE = '#5A33C5';

export default function PendingComplaintListScreen({navigation}) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const records = await fetchPendingComplaints(context.EmpCode);
      setComplaints(records);
    } catch (error) {
      console.log('PENDING COMPLAINT LIST ERROR =>', error);
      Alert.alert('Error', 'Pending complaint list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadComplaints);
    return unsubscribe;
  }, [loadComplaints, navigation]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Pending Complaint List"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : complaints.length ? (
            complaints.map(record => (
              <ComplaintCard
                key={record.id}
                record={record}
                status="Pending"
                personLabel="Complaint To"
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No pending complaint data found.</Text>
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
    paddingTop: 28,
    paddingBottom: 36,
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
    color: '#777',
    fontSize: 14,
    marginTop: 50,
    textAlign: 'center',
  },
});
