import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function NotificationsScreen({navigation}) {
  const notifications = [1, 2, 3, 4];

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Notifications"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {notifications.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              style={styles.card}>
              <View style={styles.bellCircle}>
                <Text style={styles.bellIcon}>♧</Text>
              </View>

              <View style={styles.textBox}>
                <Text style={styles.title}>
                  Time for evening classes 5:30pm from Monday 26-06-2023
                </Text>
                <Text style={styles.date}>20-06-2023</Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    backgroundColor: '#F7F7F7',
  },
  content: {
    paddingHorizontal: 21,
    paddingTop: 29,
    paddingBottom: 30,
  },
  card: {
    minHeight: 89,
    backgroundColor: '#F0F0F0',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    marginBottom: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#069BEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bellIcon: {
    color: '#fff',
    fontSize: 27,
    lineHeight: 27,
  },
  textBox: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    color: '#222',
    lineHeight: 19,
    fontWeight: '500',
  },
  date: {
    marginTop: 10,
    fontSize: 11,
    color: '#777',
  },
  arrow: {
    fontSize: 30,
    color: '#111',
    marginTop: -4,
  },
});