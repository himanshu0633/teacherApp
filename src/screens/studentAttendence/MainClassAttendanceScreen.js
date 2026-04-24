import React from 'react';
import {View, SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import AttendanceDetailsCard from '../studentAttendence/AttendanceDetailsCard';

export default function MainClassAttendanceScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      {/* Top SafeArea same header color */}
      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Main Class Attendance"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      {/* Body */}
      <SafeAreaView style={styles.container}>
        <AttendanceDetailsCard />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#5A33C5',
  },

  topSafe: {
    backgroundColor: '#5A33C5',
  },

  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
});