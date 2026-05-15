import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {BASE_URL} from '../../utils/constants';

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

export default function EditProfileScreen({navigation}) {
  const [teacher, setTeacher] = useState({});
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const raw = await AsyncStorage.getItem('teacherData');
      const parsed = raw ? JSON.parse(raw) : {};
      const storedPic =
        (await AsyncStorage.getItem('profile_pic')) ||
        (await AsyncStorage.getItem('profil_pic')) ||
        parsed?.profile_pic ||
        parsed?.profil_pic ||
        '';

      setTeacher(parsed);
      setName(parsed?.name || '');
      setMobile(parsed?.MobileNo || '');
      setAddress(parsed?.ResidentialAddress || '');
      setProfilePic(storedPic);

      try {
        const data = await postForm('get-profile.php', {
          EmpCode: parsed?.EmpCode,
          SessionId: parsed?.SessionId || parsed?.Session,
          BranchId: parsed?.BranchId,
        });

        setMobile(data?.mobileno || parsed?.MobileNo || '');
        setAddress(data?.address || parsed?.ResidentialAddress || '');
        setProfilePic(
          data?.profil_pic || data?.profile_pic || data?.EmpImage || storedPic,
        );
      } catch (error) {
        console.log('GET PROFILE ERROR =>', error);
      }
    };

    loadProfile();
  }, []);

  const onUpdate = async () => {
    if (!mobile.trim() || !address.trim()) {
      Alert.alert('Error', 'Mobile number and address are required');
      return;
    }

    setSaving(true);

    try {
      const data = await postForm('update-profile.php', {
        EmpCode: teacher?.EmpCode,
        mobileno: mobile.trim(),
        address: address.trim(),
        BranchId: teacher?.BranchId,
        SessionId: teacher?.SessionId || teacher?.Session,
      });

      const updatedTeacher = {
        ...teacher,
        name,
        MobileNo: mobile.trim(),
        ResidentialAddress: address.trim(),
        profil_pic: data?.profil_pic || data?.profile_pic || profilePic,
        profile_pic: data?.profile_pic || data?.profil_pic || profilePic,
      };

      await AsyncStorage.setItem('teacherData', JSON.stringify(updatedTeacher));
      await AsyncStorage.setItem('MobileNo', mobile.trim());
      await AsyncStorage.setItem('ResidentialAddress', address.trim());

      if (updatedTeacher.profil_pic) {
        await AsyncStorage.setItem('profil_pic', updatedTeacher.profil_pic);
        await AsyncStorage.setItem('profile_pic', updatedTeacher.profil_pic);
      }

      Alert.alert('Success', data?.message || 'Profile updated', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.log('UPDATE PROFILE ERROR =>', error);
      Alert.alert('Error', 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader
          title="My Profile"
          onBack={() => navigation.goBack()}
          backgroundColor="#1686C7"
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topCurveWrap}>
            <View style={styles.topCurve} />
          </View>

          <View style={styles.avatarWrap}>
            <Image
              source={
                profilePic
                  ? {uri: profilePic}
                  : require('../../assets/images/avatar-boy.png')
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.formWrap}>
            <Input label="Name" value={name} onChangeText={setName} />
            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
            <Input
              label="Address"
              value={address}
              onChangeText={setAddress}
              multiline
              inputStyle={{height: 90, textAlignVertical: 'top'}}
            />

            <TouchableOpacity style={styles.updateBtn} onPress={onUpdate}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Input({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  inputStyle = {},
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>
        {label} <Text style={{color: 'red'}}>*</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, inputStyle]}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#1686C7'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  topCurveWrap: {
    height: 90,
    overflow: 'hidden',
    backgroundColor: '#1686C7',
  },
  topCurve: {
    height: 180,
    width: '140%',
    alignSelf: 'center',
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    backgroundColor: '#1686C7',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -55,
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  formWrap: {
    paddingHorizontal: 22,
    paddingTop: 26,
  },
  inputWrap: {
    marginBottom: 18,
  },
  label: {
    position: 'absolute',
    left: 14,
    top: 6,
    zIndex: 2,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 2,
    fontSize: 12,
    color: '#8D8D8D',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#F3F3F3',
  },
  updateBtn: {
    marginTop: 16,
    backgroundColor: '#5A33C5',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
