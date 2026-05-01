import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Link2, Search} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const BLUE = '#0B96E8';
const TEXT = '#202124';

const dalRecords = [
  {
    id: '1',
    name: 'Vipan Sharma',
    empCode: '307',
    date: '12-07-2023',
    description: 'Performed CBO duty. Resolved the problem of HN-10th Class',
  },
  {
    id: '2',
    name: 'Vipan Sharma',
    empCode: '307',
    date: '12-07-2023',
    description: 'Performed CBO duty. Resolved the problem of HN-10th Class',
  },
];

function RecordCard({record}) {
  const handleAttachment = () => {
    Alert.alert('Attachment', 'No attachment available for this record.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>Date: {record.date}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{record.name}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Emp Code</Text>
          <Text style={styles.value}>{record.empCode}</Text>
        </View>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{record.description}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.attachmentRow}
        onPress={handleAttachment}>
        <View style={styles.attachmentIcon}>
          <Link2 size={20} color="#222" strokeWidth={2.1} />
        </View>
        <Text style={styles.attachmentText}>View Attachment</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EmployeeDalRecordScreen({navigation}) {
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredRecords = dalRecords.filter(record => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      record.name.toLowerCase().includes(normalizedSearch) ||
      record.empCode.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Employee DAL Record"
        onBack={() => navigation.goBack()}
      />

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
            <RecordCard key={record.id} record={record} />
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
    marginBottom: 23,
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
    borderColor: '#E0E4EA',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
    overflow: 'hidden',
  },
  cardTop: {
    minHeight: 41,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  datePill: {
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 9,
    paddingBottom: 18,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 5,
  },
  value: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionBox: {
    minHeight: 77,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 8,
    backgroundColor: '#F4F4F6',
    marginHorizontal: 15,
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 12,
  },
  descriptionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  descriptionText: {
    color: '#666A70',
    fontSize: 12,
    lineHeight: 16,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 18,
  },
  attachmentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  attachmentText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6D7179',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
