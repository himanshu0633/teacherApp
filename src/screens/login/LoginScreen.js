import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, COLORS } from '../../utils/constants';

const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    LOGIN: 'tlogin.php',
  },
};

export default function LoginScreen() {
  const { login } = useAuth();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [empCode, setEmpCode] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  const saveTeacherData = async (teacherData) => {
    await AsyncStorage.multiSet([
      ['teacherData', JSON.stringify(teacherData)],
      ['empcode', `${teacherData.EmpCode || ''}`],
      ['empId', `${teacherData.EmpID || ''}`],
      ['teacherName', teacherData.name || ''],
      ['empTypeId', `${teacherData.EmpTypeID || ''}`],
      ['jobType', teacherData.JobType || ''],
      ['sessionName', teacherData.SessionName || ''],
      ['departmentName', teacherData.DepartmentName || ''],
      ['loginTypeName', teacherData.LoginTypeName || ''],
      ['designationName', teacherData.DesignationName || ''],
      ['dob', teacherData.DOB || ''],
      ['doj', teacherData.DOJ || ''],
      ['residentialAddress', teacherData.ResidentialAddress || ''],
      ['mobileNo', teacherData.MobileNo || ''],
      ['empCategory', teacherData.EmpCategory || ''],
      ['gender', teacherData.Gender || ''],
      ['session', `${teacherData.Session || ''}`],
      ['branchId', `${teacherData.BranchId || ''}`],
      ['branchName', teacherData.branchName || ''],
      ['sectionName', teacherData.SectionName || ''],
      ['sectionId', `${teacherData.SectionId || ''}`],
      ['classId', `${teacherData.Classid || ''}`],
      ['className', teacherData.ClassName || ''],
    ]);
  };

  const handleLogin = async () => {
    if (!empCode.trim()) {
      Alert.alert('Error', 'Please enter Employee Code');
      return;
    }

    if (!dob.trim()) {
      Alert.alert('Error', 'Please enter Date of Birth (dd-mm-yyyy)');
      return;
    }

    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!dateRegex.test(dob)) {
      Alert.alert('Error', 'Please enter DOB in dd-mm-yyyy format (e.g., 14-04-1984)');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('empcode', empCode);
      formData.append('dob', dob);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error('Invalid response from server');
      }

      if (data?.response === 'Logged') {
        await saveTeacherData(data);
        await login(data);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Login Failed', data?.message || data?.response || 'Invalid credentials');
      }
    } catch (error) {
      console.error('[LOGIN] error', error);
      Alert.alert('Network Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logoWidth = Math.min(220, Math.max(160, windowWidth * 0.52));
  const logoHeight = logoWidth * (57 / 200);
  const topSectionHeight = Math.max(230, Math.min(360, windowHeight * 0.36));
  const logoTopSpacing = Math.max(56, Math.min(110, windowHeight * 0.12));
  const bottomGradientHeight = Math.max(150, Math.min(227, windowHeight * 0.28));

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.topSection, { height: topSectionHeight }]}> 
        <ImageBackground
          source={require('../../assets/images/abstract-blue-and-orange-wave.png')}
          style={styles.fullBackground}
          resizeMode="contain">
          <View style={[styles.logoContainer, { marginTop: logoTopSpacing }]}> 
            <Image
              source={require('../../assets/images/logoAndroid.png')}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>

      <View style={styles.formSection}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Employee Code"
              placeholderTextColor={COLORS.text}
              style={styles.input}
              value={empCode}
              onChangeText={setEmpCode}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="DD-MM-YYYY"
              placeholderTextColor={COLORS.text}
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              keyboardType="numeric"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </View>

      <LinearGradient
        colors={['#fff', '#3FA3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.bottomGradient, { height: bottomGradientHeight }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topSection: {
    width: '100%',
    backgroundColor: COLORS.white,
  },
  fullBackground: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 57,
  },
  formSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 30,
  },
  formArea: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 20,
  },
  inputWrapper: {
    backgroundColor: COLORS.background,
    height: 54,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: COLORS.darkText,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
    padding: 0,
  },
  loginButton: {
    marginTop: 16,
    height: 54,
    borderRadius: 30,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 227,
  },
});
