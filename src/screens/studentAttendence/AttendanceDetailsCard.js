import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

const attendanceData = [
  {
    admNo: '111459',
    rollNo: '901',
    name: 'Ayush\nSharma',
    status: 'P',
  },
  {
    admNo: '111190',
    rollNo: '804',
    name: 'Yogesh\nSharma',
    status: 'A',
  },
  {
    admNo: '110835',
    rollNo: '905',
    name: 'Nandika',
    status: 'L',
  },
];

function CountBox({label, value, color}) {
  return (
    <View style={styles.countCard}>
      <View style={[styles.badge, {backgroundColor: color}]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <Text style={styles.countText}>{value}</Text>
    </View>
  );
}

function StatusBadge({status}) {
  const bg =
    status === 'P' ? '#2FB52B' : status === 'A' ? '#FF1212' : '#F2B515';

  return (
    <View style={[styles.statusBadge, {backgroundColor: bg}]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

export default function AttendanceDetailsCard() {
  const [selectedDate, setSelectedDate] = useState('28-07-2023');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.field}>
        <Text style={styles.label}>
          Choose Date <Text style={styles.star}>*</Text>
        </Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.input}
          placeholder="Choose Date"
          placeholderTextColor="#7B7B7B"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>
            Class <Text style={styles.star}>*</Text>
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.selectBox}>
            <Text style={styles.selectText}>
              {selectedClass || 'Class'}
            </Text>
            <Text style={styles.selectArrow}>⌄</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>
            Section <Text style={styles.star}>*</Text>
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.selectBox}>
            <Text style={styles.selectText}>
              {selectedSection || 'Section'}
            </Text>
            <Text style={styles.selectArrow}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>View Attendance</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>Total Students: 35</Text>
        </View>

        <View style={styles.countRow}>
          <CountBox label="A" value="01" color="#FF1212" />
          <CountBox label="L" value="03" color="#F2B515" />
          <CountBox label="P" value="31" color="#2FB52B" />
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderText, styles.cellAdm]}>Adm No.</Text>
          <Text style={[styles.tableHeaderText, styles.cellRoll]}>Roll No.</Text>
          <Text style={[styles.tableHeaderText, styles.cellName]}>Name</Text>
          <Text style={[styles.tableHeaderText, styles.cellStatus]}>Status</Text>
        </View>

        {attendanceData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index === attendanceData.length - 1 && {borderBottomWidth: 0},
            ]}>
            <Text style={[styles.tableCellText, styles.cellAdm]}>{item.admNo}</Text>
            <Text style={[styles.tableCellText, styles.cellRoll]}>{item.rollNo}</Text>
            <Text style={[styles.tableCellText, styles.cellName]}>{item.name}</Text>
            <View style={[styles.cellStatus, styles.statusCellWrap]}>
              <StatusBadge status={item.status} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 30,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '47.5%',
  },
  label: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 2,
    fontSize: 11,
    color: '#777',
    backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  star: {
    color: '#FF2E2E',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 15,
    color: '#222',
  },
  selectBox: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: '#222',
  },
  selectArrow: {
    fontSize: 18,
    color: '#333',
    marginTop: -4,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#0A9AF6',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  summaryHeader: {
    height: 38,
    backgroundColor: '#1097E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryHeaderText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  countCard: {
    width: '29.5%',
    backgroundColor: '#EEF1F3',
    borderRadius: 6,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  countText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '500',
  },
  table: {
    borderWidth: 1,
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
  },
  tableHeaderRow: {
    backgroundColor: '#F3F3F3',
  },
  tableRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#D9D9D9',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  tableCellText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  cellAdm: {
    width: '20%',
  },
  cellRoll: {
    width: '20%',
  },
  cellName: {
    width: '40%',
  },
  cellStatus: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCellWrap: {
    flexDirection: 'row',
  },
  statusBadge: {
    minWidth: 18,
    height: 24,
    paddingHorizontal: 4,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});