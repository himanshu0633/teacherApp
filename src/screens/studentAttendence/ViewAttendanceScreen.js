import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function ViewAttendanceScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      {/* same color in safe area */}
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="View Attendance"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.heading}>View Attendance for</Text>

          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.optionCard}
              onPress={() =>
                navigation.navigate('MainClassAttendanceScreen')
              }>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2920/2920061.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.optionText}>Main Class</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.optionCard}
              onPress={() =>
                navigation.navigate('CoachingClassAttendanceScreen')
              }>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.optionText}>Coaching Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#5A33C5',
  },

  /* top notch area */
  topSafe: {
    backgroundColor: '#5A33C5',
  },

  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },

  content: {
    paddingTop: 24,
    paddingHorizontal: 22,
  },

  heading: {
    textAlign: 'center',
    color: '#0A8EF0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  optionCard: {
    width: '46.5%',
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 22,
  },

  icon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
});