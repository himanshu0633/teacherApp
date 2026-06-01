import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarDays} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const BLUE = '#0098EE';
const TEXT = '#252525';

const getTeacherContext = async () => {
  const [saved, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const normalizeCalendar = item => ({
  id: String(item?.id || ''),
  description: item?.description || item?.Description || 'Academic Calendar',
  file: item?.file || item?.File || item?.pic || item?.Pic || '',
  date: item?.createddate || item?.CreatedDate || item?.date || '',
});

export default function AcademicCalendarScreen({navigation}) {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
      };

      console.log('ACADEMIC CALENDAR PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.ACADEMIC_CALENDAR, payload);
      console.log('ACADEMIC CALENDAR RESPONSE =>', data);

      if (String(data?.status || '').toLowerCase() === 'true') {
        const [nextCalendar] = (Array.isArray(data?.response) ? data.response : [])
          .map(normalizeCalendar);
        setCalendar(nextCalendar || null);
        return;
      }

      setCalendar(null);
    } catch (error) {
      console.log('ACADEMIC CALENDAR ERROR =>', error);
      Alert.alert('Error', 'Academic calendar could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const openCalendar = async () => {
    if (!calendar?.file) {
      Alert.alert('No File', 'Calendar file is not available.');
      return;
    }

    try {
      await Linking.openURL(calendar.file);
    } catch (error) {
      console.log('ACADEMIC CALENDAR OPEN ERROR =>', error);
      Alert.alert('Error', 'Calendar file could not be opened.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Academic Calendar"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <View pointerEvents="none" style={styles.bottomDecor}>
          <View style={[styles.decorBlock, styles.decorBlueLarge]} />
          <View style={[styles.decorBlock, styles.decorBlueSmall]} />
          <View style={[styles.decorBlock, styles.decorYellowLarge]} />
          <View style={[styles.decorBlock, styles.decorGreen]} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading calendar...</Text>
            </View>
          ) : calendar ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.calendarCard}
              onPress={openCalendar}>
              <Text style={styles.updatedText}>
                Updated on: {calendar.date || '-'}
              </Text>

              <View style={styles.iconCircle}>
                <CalendarDays size={35} color="#28BFA0" strokeWidth={2.2} />
              </View>

              <Text style={styles.downloadText}>Download</Text>
              <Text style={styles.titleText}>{calendar.description}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>No academic calendar found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#F7F7F7', overflow: 'hidden'},
  content: {paddingHorizontal: 19, paddingTop: 24, paddingBottom: 34},
  bottomDecor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 270,
  },
  decorBlock: {
    position: 'absolute',
    borderRadius: 24,
    opacity: 0.26,
  },
  decorBlueLarge: {
    left: -26,
    bottom: 10,
    width: 155,
    height: 175,
    backgroundColor: '#29C6E8',
  },
  decorBlueSmall: {
    left: 18,
    bottom: 136,
    width: 78,
    height: 88,
    backgroundColor: '#8DE7F5',
  },
  decorYellowLarge: {
    right: -22,
    bottom: 20,
    width: 170,
    height: 190,
    backgroundColor: '#F2EA22',
  },
  decorGreen: {
    right: 56,
    bottom: -8,
    width: 105,
    height: 118,
    backgroundColor: '#80D82C',
  },
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 10, color: '#777', fontSize: 13},
  emptyText: {
    marginTop: 70,
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
  },
  calendarCard: {
    minHeight: 212,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 5,
  },
  updatedText: {fontSize: 14, color: BLUE, marginBottom: 18},
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD25D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  downloadText: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '900',
    marginBottom: 5,
  },
  titleText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
});
