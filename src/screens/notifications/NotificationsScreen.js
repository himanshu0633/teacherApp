import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Bell} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const getEmpCode = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  return parsed?.EmpCode || (await AsyncStorage.getItem('EmpCode')) || '';
};

const unreadOnly = rows =>
  rows.filter(item => String(item?.view || '').trim().toLowerCase() !== 'yes');

const normalizeNotification = item => ({
  id: String(item?.id || item?.taskid || Math.random()),
  message: item?.messages || '-',
  type: item?.type || '',
  view: item?.view || '',
  sendBy: item?.sendby || '',
  createdAt: item?.createdate || '',
});

export default function NotificationsScreen({navigation, route}) {
  const [notifications, setNotifications] = useState(
    route?.params?.notifications || [],
  );
  const [loading, setLoading] = useState(!route?.params?.notifications);

  useEffect(() => {
    if (route?.params?.notifications) {
      setNotifications(route.params.notifications);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const empcode = await getEmpCode();

        if (!empcode) {
          Alert.alert('Error', 'EmpCode not found.');
          return;
        }

        console.log('NOTIFICATIONS SCREEN PAYLOAD =>', {empcode});
        const data = await postForm(API_ENDPOINTS.NOTIFICATIONS, {empcode});
        const rows = Array.isArray(data?.response) ? data.response : [];
        setNotifications(unreadOnly(rows));
      } catch (error) {
        console.log('NOTIFICATIONS SCREEN ERROR =>', error);
        Alert.alert('Error', 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [route?.params?.notifications]);

  const visibleNotifications = notifications.map(normalizeNotification);

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
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#5A33C5" />
            </View>
          ) : visibleNotifications.length ? (
            visibleNotifications.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.card}>
                <View style={styles.bellCircle}>
                  <Bell size={24} color="#FFFFFF" strokeWidth={2.2} />
                </View>

                <View style={styles.textBox}>
                  <Text style={styles.title}>{item.message}</Text>
                  {item.sendBy ? (
                    <Text style={styles.meta}>By: {item.sendBy}</Text>
                  ) : null}
                  <View style={styles.bottomRow}>
                    <Text style={styles.date}>{item.createdAt || '-'}</Text>
                    {item.type ? (
                      <Text style={styles.typeText}>{item.type}</Text>
                    ) : null}
                  </View>
                </View>

                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>No new notifications</Text>
            </View>
          )}
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
    paddingVertical: 13,
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
  textBox: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    color: '#222',
    lineHeight: 19,
    fontWeight: '600',
  },
  meta: {
    marginTop: 7,
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  date: {
    fontSize: 11,
    color: '#777',
  },
  typeText: {
    fontSize: 11,
    color: '#5A33C5',
    fontWeight: '700',
  },
  arrow: {
    fontSize: 30,
    color: '#111',
    marginTop: -4,
  },
  centerState: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6D7179',
    fontSize: 14,
    fontWeight: '700',
  },
});
