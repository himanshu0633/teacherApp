import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {BASE_URL} from '../../utils/constants';

const MONTHS = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

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

export default function MySalaryScreen({navigation}) {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalary = async () => {
      try {
        const raw = await AsyncStorage.getItem('teacherData');
        const teacher = raw ? JSON.parse(raw) : {};
        const data = await postForm('SalaryList.php', {
          EmpCode: teacher?.EmpCode,
          BranchId: teacher?.BranchId,
        });

        setSalaryData(data?.response?.rest || []);
      } catch (error) {
        console.log('SALARY LIST ERROR =>', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalary();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="My Salary" onBack={() => navigation.goBack()} />

        <ScrollView style={styles.tableWrap}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, {flex: 1.1}]}>Month</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Year</Text>
            <Text style={[styles.headerCell, {flex: 1.2}]}>Salary</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Action</Text>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loader} color="#5A33C5" />
          ) : salaryData.length === 0 ? (
            <Text style={styles.emptyText}>No salary record found</Text>
          ) : (
            salaryData.map((item, index) => (
              <View key={`${item.SalaryID}-${index}`} style={styles.row}>
                <Text style={[styles.cell, {flex: 1.1}]}>
                  {MONTHS[Number(item.Month)] || item.Month}
                </Text>
                <Text style={[styles.cell, {flex: 1}]}>{item.Year}</Text>
                <Text style={[styles.cell, {flex: 1.2}]}>
                  {item.NetSalary}
                </Text>
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
            ))
          )}
        </ScrollView>
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
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
});
