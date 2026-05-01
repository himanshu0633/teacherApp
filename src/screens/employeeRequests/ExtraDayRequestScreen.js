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
import {CircleCheck, CircleX, Clock, UserRound} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const TEXT = '#202124';
const GREEN = '#25B938';
const RED = '#FF4148';

const extraDayRequests = [
  {
    id: '1',
    date: '31-07-2023',
    requestBy: 'Vipan Sharma',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ad eos igitur converte te, quaeso. Quam si explicavisset, non tam haesitaret.',
  },
  {
    id: '2',
    date: '02-08-2023',
    requestBy: 'Sangeeta Devi',
    reason:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ad eos igitur converte te, quaeso. Quam si explicavisset, non tam haesitaret.',
  },
];

function DetailCell({Icon, label, value}) {
  return (
    <View style={styles.detailCell}>
      <View style={styles.labelRow}>
        <Icon size={12} color={GREEN} strokeWidth={2} />
        <Text style={styles.label}>{label}</Text>
      </View>
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
      style={[styles.actionButton, isApprove ? styles.approve : styles.cancel]}
      onPress={onPress}>
      <View style={styles.actionIconWrap}>
        <Icon
          size={17}
          color={isApprove ? GREEN : RED}
          strokeWidth={2.4}
        />
      </View>
      <Text style={styles.actionText}>{isApprove ? 'Approve' : 'Cancel'}</Text>
    </TouchableOpacity>
  );
}

function ExtraDayCard({request}) {
  const handleAction = action => {
    Alert.alert('Extra Day Request', `${action} ${request.requestBy}'s request`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Request Detail</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <DetailCell Icon={Clock} label="Request Date" value={request.date} />
          <DetailCell
            Icon={UserRound}
            label="Request By"
            value={request.requestBy}
          />
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>Reason</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </View>

        <View style={styles.actionRow}>
          <ActionButton
            type="approve"
            onPress={() => handleAction('Approved')}
          />
          <ActionButton type="cancel" onPress={() => handleAction('Cancelled')} />
        </View>
      </View>
    </View>
  );
}

export default function ExtraDayRequestScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CommonHeader title="Extra Day Request" onBack={() => navigation.goBack()} />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {extraDayRequests.map(request => (
            <ExtraDayCard key={request.id} request={request} />
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
    paddingTop: 28,
    paddingBottom: 36,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 34,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  cardTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 17,
  },
  detailCell: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginLeft: 4,
  },
  value: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 16,
  },
  reasonBox: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 7,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 13,
    marginBottom: 16,
  },
  reasonTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonText: {
    color: '#666A70',
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    height: 31,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 14,
  },
  approve: {
    backgroundColor: GREEN,
  },
  cancel: {
    backgroundColor: RED,
  },
  actionIconWrap: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
