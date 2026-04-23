import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {COLORS, BASE_URL} from '../../utils/constants';

const menuItems = [
  {title: 'My Salary', screen: 'MySalaryScreen'},
  {title: 'Apply Leaves', screen: 'ApplyLeaveScreen'},
  {title: 'My Leave Record', screen: 'MyLeaveRecordScreen'},
  {title: 'Change Password', screen: 'ChangePasswordScreen'},
];

export default function MyProfileScreen({navigation}) {
  const [openInfo, setOpenInfo] = useState(true);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    empCode: '',
    designation: '',
    department: '',
    dob: '',
    doj: '',
    mobile: '',
    address: '',
    empImage: '',
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem('userData');
      const parsed = userData ? JSON.parse(userData) : {};

      const formData = new FormData();
      formData.append('EmpCode', parsed?.EmpCode || '');
      formData.append('SessionId', parsed?.Session || '');
      formData.append('BranchId', parsed?.BranchId || '');

      const response = await fetch(`${BASE_URL}get-profile.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setProfileData({
        name: parsed?.name || '',
        empCode: parsed?.EmpCode || '',
        designation: parsed?.DesignationName || '',
        department: parsed?.DepartmentName || '',
        dob: parsed?.DOB || '',
        doj: parsed?.DOJ || '',
        mobile: data?.mobileno || '',
        address: data?.address || '',
        empImage: data?.EmpImage || '',
      });
    } catch (error) {
      console.log('PROFILE ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader
          title="MY PROFILE"
          backgroundColor={COLORS.primary}
          onBack={() => navigation.goBack()}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topCurveWrap}>
            <View style={styles.topCurve} />
          </View>

          <View style={styles.avatarWrap}>
            <Image
              source={
                profileData.empImage
                  ? {uri: profileData.empImage}
                  : require('../../assets/images/avatar-boy.png')
              }
              style={styles.avatar}
            />

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfileScreen')}>
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.subText}>
            Emp Code: {profileData.empCode}
          </Text>
          <Text style={styles.subText}>
            {profileData.designation}
          </Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setOpenInfo(!openInfo)}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Text style={styles.arrow}>
                {openInfo ? '⌄' : '›'}
              </Text>
            </TouchableOpacity>

            {openInfo && (
              <View style={styles.infoBody}>
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                ) : (
                  <>
                    <InfoRow
                      label="Department"
                      value={profileData.department}
                    />
                    <InfoRow
                      label="Date of Birth"
                      value={profileData.dob}
                    />
                    <InfoRow
                      label="Date of Joining"
                      value={profileData.doj}
                    />
                    <InfoRow
                      label="Mobile No."
                      value={profileData.mobile}
                    />
                    <InfoRow
                      label="Address"
                      value={profileData.address}
                    />
                  </>
                )}
              </View>
            )}
          </View>

          {menuItems.map(item => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{height: 30}} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value || '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  topCurveWrap: {
    height: 90,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },

  topCurve: {
    height: 180,
    width: '140%',
    alignSelf: 'center',
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    backgroundColor: COLORS.primary,
  },

  avatarWrap: {
    alignItems: 'center',
    marginTop: -55,
    marginBottom: 12,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
  },

  editBtn: {
    position: 'absolute',
    right: 55,
    top: 35,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editIcon: {
    fontSize: 18,
    color: COLORS.highlight,
    fontWeight: '700',
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: 8,
  },

  subText: {
    fontSize: 16,
    color: COLORS.highlight,
    textAlign: 'center',
    marginTop: 4,
  },

  card: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.highlight,
    overflow: 'hidden',
  },

  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  arrow: {
    fontSize: 24,
    color: COLORS.darkText,
  },

  infoBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  infoLabel: {
    width: '44%',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  infoValue: {
    width: '56%',
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },

  menuCard: {
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.highlight,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  menuArrow: {
    fontSize: 28,
    color: COLORS.darkText,
  },
});