import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

const salaryData = [
  {month: 'June', year: '2023', salary: '45088.00'},
  {month: 'May', year: '2023', salary: '35087.00'},
  {month: 'April', year: '2023', salary: '38230.00'},
];

export default function MySalaryScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="My Salary" onBack={() => navigation.goBack()} />

        <View style={styles.tableWrap}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, {flex: 1.1}]}>Month</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Year</Text>
            <Text style={[styles.headerCell, {flex: 1.2}]}>Salary</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Action</Text>
          </View>

          {salaryData.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.cell, {flex: 1.1}]}>{item.month}</Text>
              <Text style={[styles.cell, {flex: 1}]}>{item.year}</Text>
              <Text style={[styles.cell, {flex: 1.2}]}>{item.salary}</Text>
              <View style={[styles.cell, {flex: 1}]}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    navigation.navigate('SalaryReceiptScreen', {item})
                  }>
                  <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  tableWrap: {
    margin: 18,
    borderWidth: 1,
    borderColor: '#CFCFCF',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#25B84A',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerCell: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  cell: {
    paddingVertical: 14,
    textAlign: 'center',
    color: '#333',
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtn: {
    backgroundColor: '#5A33C5',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});