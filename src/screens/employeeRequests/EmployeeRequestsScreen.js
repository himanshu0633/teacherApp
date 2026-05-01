import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarDays, ChevronRight} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const BLUE = '#0798EA';
const TEXT = '#202124';

const requestItems = [
  {id: 'extra-day', title: 'Extra Day'},
  {id: 'late-attendance', title: 'Late Attendance'},
  {id: 'not-able-attendance', title: 'Not Able to Mark Attendance'},
];

function RequestRow({item, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.requestRow}
      onPress={() => onPress(item)}>
      <View style={styles.iconCircle}>
        <CalendarDays size={25} color={BLUE} strokeWidth={2} />
      </View>

      <Text style={styles.requestTitle}>{item.title}</Text>

      <ChevronRight size={22} color={TEXT} strokeWidth={2.1} />
    </TouchableOpacity>
  );
}

export default function EmployeeRequestsScreen({navigation}) {
  const [branchName, setBranchName] = useState('HIM ACADEMY PUBLIC SCHOOL, HIRANAGAR');

  const loadBranchName = useCallback(async () => {
    try {
      const storedBranch = await AsyncStorage.getItem('branchName');
      if (storedBranch && storedBranch !== 'NA') {
        setBranchName(storedBranch.toUpperCase());
      }
    } catch (error) {
      console.log('EMPLOYEE REQUEST BRANCH LOAD ERROR =>', error);
    }
  }, []);

  useEffect(() => {
    loadBranchName();
  }, [loadBranchName]);

  const handleRequestPress = item => {
    if (item.id === 'extra-day') {
      navigation.navigate('ExtraDayRequestScreen');
      return;
    }

    Alert.alert("Employee's Requests", `${item.title} selected`);
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Employee’s Requests"
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.branchText}>{branchName}</Text>

          {requestItems.map(item => (
            <RequestRow
              key={item.id}
              item={item}
              onPress={handleRequestPress}
            />
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
    paddingHorizontal: 27,
    paddingTop: 34,
    paddingBottom: 36,
  },
  branchText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 22,
  },
  requestRow: {
    minHeight: 59,
    borderRadius: 7,
    backgroundColor: '#F1F1F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 19,
    paddingRight: 15,
    marginBottom: 14,
  },
  iconCircle: {
    width: 49,
    height: 49,
    borderRadius: 24.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 28,
  },
  requestTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
  },
});
