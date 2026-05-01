import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CalendarDays, CircleCheck, CircleX} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const BLUE = '#0798EA';
const TEXT = '#202124';

const leaveRequests = [
  {
    id: '1',
    employeeName: 'Deepa Sharma',
    empCode: '1196',
    dateFrom: '20-06-2023',
    dateTo: '21-06-2023',
    reason: 'I am not well. So can not attend the school',
    days: '1',
    status: 'Pending',
  },
  {
    id: '2',
    employeeName: 'Deepa Sharma',
    empCode: '1196',
    dateFrom: '20-06-2023',
    dateTo: '21-06-2023',
    reason: 'I am not well. So can not attend the school',
    days: '1',
    status: 'Pending',
  },
];

function RequestInfo({label, value}) {
  return (
    <View style={styles.infoCol}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ActionButton({type, onPress}) {
  const isApprove = type === 'approve';
  const Icon = isApprove ? CircleCheck : CircleX;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.actionButton, isApprove ? styles.approve : styles.reject]}
      onPress={onPress}>
      <View style={styles.actionIconWrap}>
        <Icon
          size={15}
          color={isApprove ? '#26B83A' : '#FF4148'}
          strokeWidth={2.3}
        />
      </View>
      <Text style={styles.actionText}>{isApprove ? 'Approve' : 'Reject'}</Text>
    </TouchableOpacity>
  );
}

function LeaveRequestCard({request}) {
  const handleAction = action => {
    Alert.alert('Leave Request', `${action} ${request.employeeName}'s request`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Leave Detail</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <RequestInfo label="Employee Name" value={request.employeeName} />
          <RequestInfo label="Emp Code" value={request.empCode} />
        </View>

        <View style={styles.infoRow}>
          <RequestInfo label="Date From:" value={request.dateFrom} />
          <RequestInfo label="Date To:" value={request.dateTo} />
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Reason for Leave:</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.daysPill}>
            <View style={styles.dayCountCircle}>
              <Text style={styles.dayCount}>{request.days}</Text>
            </View>
            <Text style={styles.daysText}>Days</Text>
          </View>

          <View style={styles.actions}>
            <ActionButton
              type="approve"
              onPress={() => handleAction('Approved')}
            />
            <ActionButton
              type="reject"
              onPress={() => handleAction('Rejected')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function EmployeeLeaveRequestScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Employee Leave Request"
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <CalendarDays size={20} color={BLUE} strokeWidth={2.1} />
              <Text style={styles.summaryLabel}>Total Leave Request</Text>
            </View>
            <Text style={styles.summaryCount}>02</Text>
          </View>

          {leaveRequests.map(request => (
            <LeaveRequestCard key={request.id} request={request} />
          ))}
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
    paddingHorizontal: 19,
    paddingTop: 19,
    paddingBottom: 36,
  },
  summaryCard: {
    height: 45,
    borderWidth: 1,
    borderColor: '#CCE5F4',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 15,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 14,
  },
  summaryCount: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: '#C9E2F1',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E7EF',
    backgroundColor: '#EEF9FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  cardTitle: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 75,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FDBB1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 13,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  reasonBox: {
    minHeight: 63,
    borderRadius: 4,
    backgroundColor: '#DDF1FC',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 23,
  },
  reasonTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  daysPill: {
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDF1FC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 13,
  },
  dayCountCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  dayCount: {
    color: TEXT,
    fontSize: 13,
  },
  daysText: {
    color: TEXT,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    height: 30,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 13,
  },
  approve: {
    backgroundColor: '#25B938',
  },
  reject: {
    backgroundColor: '#FF4148',
  },
  actionIconWrap: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
