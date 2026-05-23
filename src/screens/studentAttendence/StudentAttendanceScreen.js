import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

export default function AttendanceScreen({navigation}) {
  const [teacher, setTeacher] = useState({
    name: 'NA',
    designation: 'NA',
    profilePic: '',
  });

  useEffect(() => {
    const loadTeacher = async () => {
      const raw = await AsyncStorage.getItem('teacherData');
      const storedName = await AsyncStorage.getItem('name');
      const storedDesignation = await AsyncStorage.getItem('DesignationName');
      const storedProfilePic =
        (await AsyncStorage.getItem('profile_pic')) ||
        (await AsyncStorage.getItem('profil_pic'));
      let parsed = {};

      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch (error) {
        parsed = {};
      }

      setTeacher({
        name: parsed?.name || storedName || 'NA',
        designation:
          parsed?.DesignationName ||
          parsed?.designation ||
          storedDesignation ||
          'NA',
        profilePic: parsed?.profile_pic || parsed?.profil_pic || storedProfilePic || '',
      });
    };

    loadTeacher();
  }, []);

  return (
    <View style={styles.root}>
      {/* Safe Area same gradient */}
      <LinearGradient
        colors={['#1A8EDE', '#3CD63F']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientWrap}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Attendance</Text>
          </View>
        </SafeAreaView>

        {/* Curve */}
        <View style={styles.curveArea} />
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: teacher.profilePic || DEFAULT_AVATAR,
            }}
            style={styles.avatar}
          />

          <Text
            style={styles.name}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.78}>
            {teacher.name}
          </Text>
          <Text style={styles.role} numberOfLines={2}>
            {teacher.designation}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.menuCard}
          onPress={() => navigation.navigate('ViewAttendanceScreen')}>
          <View style={styles.leftWrap}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
              }}
              style={styles.cardIcon}
            />

            <Text style={styles.menuTitle}>View Attendance</Text>
            
          </View>

          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
         {/* <TouchableOpacity
          activeOpacity={0.85}
          style={styles.menuCard}
          onPress={() => navigation.navigate('MarkAttendanceScreen')}>
          <View style={styles.leftWrap}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
              }}
              style={styles.cardIcon}
            />

            <Text style={styles.menuTitle}>Mark Attendance</Text>
            
          </View>

          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },

  gradientWrap: {
    height: 255,
    position: 'relative',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingHorizontal: 18,
  },

  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  backIcon: {
    color: '#fff',
    fontSize: 28,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  /* Main curve like screenshot */
  curveArea: {
    position: 'absolute',
    bottom: -1,
    left: -30,
    right: -30,
    height: 105,
    backgroundColor: '#EFEFEF',
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
  },

  body: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },

  profileSection: {
    marginTop: -45,
    alignItems: 'center',
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: 'contain',
  },

  name: {
    marginTop: 14,
    width: '100%',
    paddingHorizontal: 28,
    fontSize: 19,
    fontWeight: '900',
    color: '#222',
    textAlign: 'center',
  },

  role: {
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 28,
    fontSize: 15,
    color: '#7A7A7A',
    textAlign: 'center',
  },

  menuCard: {
    marginTop: 55,
    marginHorizontal: 24,
    backgroundColor: '#E7E7E7',
    borderRadius: 14,
    minHeight: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIcon: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginRight: 14,
  },

  menuTitle: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },

  menuArrow: {
    fontSize: 34,
    color: '#333',
    marginTop: -2,
  },
});
