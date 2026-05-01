import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Search} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const TEXT = '#202124';
const BLUE = '#0798EA';

const ptmRecords = [
  {
    id: '1',
    calledBy: 'Vipan Sharma',
    empCode: '307',
    date: '02-08-2023',
    student: 'Malvika Sharma',
    admissionNo: '112089',
    rollNo: '823',
    mobileNo: '9876543210',
    talkWith: 'Father',
    mode: 'Online',
    satisfaction: 'Very Good',
    description: 'Lorem ipsum set doler met good performance',
  },
];

function DetailRow({label, value}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function PtmRecordCard({record}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.calledText}>
          Called By: {record.calledBy} ({record.empCode})
        </Text>
        <Text style={styles.dateText}>Date: {record.date}</Text>
      </View>

      <View style={styles.cardBody}>
        <DetailRow label="Student" value={record.student} />
        <DetailRow label="Admission No" value={record.admissionNo} />
        <DetailRow label="Roll No" value={record.rollNo} />
        <DetailRow label="Mobile No" value={record.mobileNo} />
        <DetailRow label="Talk With" value={record.talkWith} />
        <DetailRow label="Mode" value={record.mode} />
        <DetailRow label="P-Satisfaction" value={record.satisfaction} />

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{record.description}</Text>
        </View>
      </View>
    </View>
  );
}

export default function EPtmRecordScreen({navigation}) {
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRecords = ptmRecords.filter(record => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      record.student.toLowerCase().includes(normalizedSearch) ||
      record.admissionNo.toLowerCase().includes(normalizedSearch) ||
      record.rollNo.toLowerCase().includes(normalizedSearch) ||
      record.calledBy.toLowerCase().includes(normalizedSearch) ||
      record.empCode.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <View style={styles.wrapper}>
      <CommonHeader title="E-PTM Record" onBack={() => navigation.goBack()} />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>List of Records</Text>

          <View style={styles.searchBox}>
            <Search size={23} color="#676A70" strokeWidth={1.9} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Enter Name or ID"
              placeholderTextColor="#686A70"
              style={styles.searchInput}
            />
          </View>

          {filteredRecords.map(record => (
            <PtmRecordCard key={record.id} record={record} />
          ))}

          {filteredRecords.length === 0 && (
            <Text style={styles.emptyText}>No records found</Text>
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
    paddingTop: 18,
    paddingBottom: 36,
  },
  heading: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 13,
  },
  searchBox: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F1F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    marginLeft: 12,
    paddingVertical: 0,
  },
  card: {
    borderWidth: 1,
    borderColor: '#B9E0F2',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 47,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E4EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  calledText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  dateText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 17,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    width: 160,
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    color: '#666A70',
    fontSize: 14,
  },
  descriptionBox: {
    minHeight: 69,
    borderRadius: 7,
    backgroundColor: '#DDF1FC',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 8,
  },
  descriptionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    color: TEXT,
    fontSize: 11,
    lineHeight: 15,
  },
  emptyText: {
    color: '#6D7179',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
