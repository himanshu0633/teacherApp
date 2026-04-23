import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

const leaves = [
  {
    title: 'Full Day',
    status: 'Approved',
    statusColor: '#31B635',
  },
  {
    title: 'Short Leave (1st Half)',
    status: 'Approved',
    statusColor: '#31B635',
  },
  {
    title: 'Short Leave (2nd Half)',
    status: 'Rejected',
    statusColor: '#F34D4D',
  },
];

export default function MyLeaveRecordScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="My Leave Record" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Approved Leaves</Text>
            <Text style={styles.summaryValue}>02</Text>
          </View>

          {leaves.map((item, index) => (
            <View key={index} style={styles.leaveCard}>
              <View style={styles.leaveHeader}>
                <Text style={styles.leaveTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.statusPill,
                    {backgroundColor: item.statusColor},
                  ]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>◔ Date From:</Text>
                  <Text style={styles.dateValue}>20-06-2023</Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>◔ Date To:</Text>
                  <Text style={styles.dateValue}>21-06-2023</Text>
                </View>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Reason for Leave:</Text>
                <Text style={styles.reasonText}>
                  I am not well. So can not attend the school
                </Text>
              </View>
            </View>
          ))}
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
});