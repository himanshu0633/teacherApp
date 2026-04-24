import React from 'react';
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

export default function AttendanceScreen({navigation}) {
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
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>VIPAN SHARMA</Text>
          <Text style={styles.role}>IT- Teacher</Text>
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
    fontSize: 20,
    fontWeight: '900',
    color: '#222',
  },

  role: {
    marginTop: 4,
    fontSize: 15,
    color: '#7A7A7A',
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