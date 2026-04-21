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
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, COLORS } from '../utils/constants'; // Import from constants.js
import { extractTokenPayload, getFcmTokenForSync, updateStudentFcmToken } from '../utils/notificationToken';
import { generateDeviceToken, getDeviceToken, sendTokenToBackend } from '../utils/tokenGenerator';
import { completeUpdateLogin } from '../utils/updateLogin';

// API Configuration using BASE_URL from constants
const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    LOGIN: 'login.php', // Note: removed leading slash since BASE_URL already ends with /
  },
};

export default function LoginScreen() {
  const { login } = useAuth();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [enrollNo, setEnrollNo] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to save student data to AsyncStorage
  const debugSavedStudentData = async () => {
    try {
      const keysToDebug = [
        'studentId',
        'enrollNo',
        'studentName',
        'className',
        'sectionName',
        'sessionName',
        'branchName',
        'branchId',
        'session',
        'fatherName',
        'motherName',
        'mobileNo',
        'dob',
        'gender',
        'address',
      ];

      const savedPairs = await AsyncStorage.multiGet(keysToDebug);
      const savedData = Object.fromEntries(savedPairs);
      console.log('[LOGIN][DB] AsyncStorage saved data =>', JSON.stringify(savedData));
    } catch (error) {
      console.error('[LOGIN][DB] saved data debug error =>', error);
    }
  };

  const saveStudentData = async (studentData) => {
    try {
      // Save all student data
      await AsyncStorage.setItem('studentData', JSON.stringify(studentData));
      
      // Also save individual important fields for quick access
      await AsyncStorage.setItem('studentId', studentData.StudentId || '');
      await AsyncStorage.setItem('enrollNo', studentData.EnrollNo || '');
      await AsyncStorage.setItem('studentName', studentData.StudentName || '');
      await AsyncStorage.setItem('className', studentData.ClassName || '');
      await AsyncStorage.setItem('sectionName', studentData.SectionName || '');
      await AsyncStorage.setItem('sessionName', studentData.SessionName || '');
      await AsyncStorage.setItem('branchName', studentData.branch_name || '');
      await AsyncStorage.setItem('branchId', `${studentData.BranchId || studentData.branch_id || studentData.branchId || studentData.branchid || ''}`);
      await AsyncStorage.setItem('session', `${studentData.SessionId || studentData.session_id || studentData.sessionId || studentData.Session || studentData.session || ''}`);
      await AsyncStorage.setItem('fatherName', studentData.FatherName || '');
      await AsyncStorage.setItem('motherName', studentData.MotherName || '');
      await AsyncStorage.setItem('mobileNo', studentData.MobileNo || '');
      await AsyncStorage.setItem('dob', studentData.DOB || '');
      await AsyncStorage.setItem('gender', studentData.Gender || '');
      await AsyncStorage.setItem('address', studentData.PermanentAddress || '');
      
      console.log('Student data saved successfully');
      await debugSavedStudentData();
      return true;
    } catch (error) {
      console.error('Error saving student data:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!enrollNo.trim()) {
      Alert.alert('Error', 'Please enter Enrollment Number');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Error', 'Please enter Date of Birth (dd-mm-yyyy)');
      return;
    }

    // Validate date format (dd-mm-yyyy)
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!dateRegex.test(dob)) {
      Alert.alert('Error', 'Please enter DOB in dd-mm-yyyy format (e.g., 05-05-2021)');
      return;
    }

    setLoading(true);

    try {
      console.log('\n====== LOGIN PROCESS START ======\n');
      
      // Step 1: Generate Device Token (unique for this device)
      console.log('[LOGIN] Step 1️⃣: Device token generation...');
      const deviceToken = await generateDeviceToken();
      
      // Step 2: Call login.php
      console.log('[LOGIN] Step 2️⃣: Calling login.php...');
      const formData = new FormData();
      formData.append('enroll_no', enrollNo);
      formData.append('dob', dob);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('[LOGIN] ✗ JSON Parse Error:', responseText);
        throw new Error('Invalid response from server');
      }

      if (data.status === true) {
        console.log('[LOGIN] ✓ login.php successful');
        
        // Step 3: Update login data and replace old data
        console.log('[LOGIN] Step 3️⃣: Updating login and replacing old data...');
        try {
          const updatedData = await completeUpdateLogin(enrollNo, BASE_URL);
          console.log('[LOGIN] ✓ Login data updated and old data replaced');
          
          // Use updated data for further operations
          data = updatedData;
        } catch (updateError) {
          console.warn('[LOGIN] ⚠️ Update login failed, continuing with initial data:', updateError.message);
          // Continue with initial data if update fails
        }

        // Save all student data to AsyncStorage
        await saveStudentData(data);
        console.log('[LOGIN] ✓ Student data saved to AsyncStorage');

        // Step 4: Send device token to backend
        console.log('[LOGIN] Step 4️⃣: Sending device token to backend...');
        const tokenPayload = extractTokenPayload(data);
        
        const tokenResponse = await sendTokenToBackend({
          studentId: tokenPayload.studentId,
          branchId: tokenPayload.branchId,
          session: tokenPayload.session,
          deviceToken: deviceToken,
          baseUrl: BASE_URL,
        });

        if (tokenResponse.success) {
          console.log('[LOGIN] ✓ Device token sent to backend successfully');
        } else {
          console.warn('[LOGIN] ⚠️ Device token send failed:', tokenResponse.message);
        }

        // Step 5: Sync FCM Token (if available)
        console.log('[LOGIN] Step 5️⃣: Syncing FCM token...');
        const fcmToken = await getFcmTokenForSync();

        if (fcmToken) {
          const tokenUpdateResponse = await updateStudentFcmToken({
            ...tokenPayload,
            token: fcmToken,
          });
          console.log('[LOGIN] ✓ FCM token synced:', tokenUpdateResponse.success ? 'SUCCESS' : 'FAILED');
        } else {
          console.log('[LOGIN] ℹ️ FCM token not available yet');
        }

        // Step 6: Call login function from AuthContext
        console.log('[LOGIN] Step 6️⃣: Updating auth context...');
        await login(data);
        console.log('[LOGIN] ✓ Auth context updated');
        
        console.log('\n====== LOGIN PROCESS COMPLETE ======\n');
        
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => {
            // Navigation will be handled by your AuthContext
          }}
        ]);
      } else {
        console.error('[LOGIN] ✗ login.php returned false');
        Alert.alert('Login Failed', data.msg || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('[LOGIN] ✗ Login Error:', error);
      Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
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
          source={require('../assets/images/hapslogoback.png')}
          style={styles.fullBackground}
          resizeMode="contain">
          
          <View style={[styles.logoContainer, { marginTop: logoTopSpacing }]}>
            <Image
              source={require('../assets/images/hapslogo.png')}
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
              placeholder="Enrollment Number"
              placeholderTextColor={COLORS.text}
              style={styles.input}
              value={enrollNo}
              onChangeText={setEnrollNo}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          {/* DOB Input */}
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
    backgroundColor: COLORS.danger, // Using danger color from constants (red)
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
