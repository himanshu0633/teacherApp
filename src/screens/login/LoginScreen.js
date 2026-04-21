import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {User, KeyRound} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext';
import {BASE_URL} from '../../utils/constants';

const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    LOGIN: 'tlogin.php',
  },
};

export default function LoginScreen() {
  const {login} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setSafeItem = async (key, value) => {
    const finalValue =
      value === null || value === undefined ? '' : String(value);
    await AsyncStorage.setItem(key, finalValue);
    console.log(`${key} => SAVED =>`, finalValue);
  };

  const saveTeacherData = async teacherData => {
    try {
      console.log('==============================');
      console.log('FULL LOGIN RESPONSE =>');
      console.log(teacherData);

      await AsyncStorage.setItem('teacherData', JSON.stringify(teacherData));
      console.log('teacherData => SAVED');

      await setSafeItem('EmpCode', teacherData?.EmpCode);
      await setSafeItem('EmpID', teacherData?.EmpID);
      await setSafeItem('name', teacherData?.name);
      await setSafeItem('EmpTypeID', teacherData?.EmpTypeID);
      await setSafeItem('JobType', teacherData?.JobType);
      await setSafeItem('SessionName', teacherData?.SessionName);
      await setSafeItem('DepartmentName', teacherData?.DepartmentName);
      await setSafeItem('LoginTypeName', teacherData?.LoginTypeName);
      await setSafeItem('DesignationName', teacherData?.DesignationName);
      await setSafeItem('DOB', teacherData?.DOB);
      await setSafeItem('DOJ', teacherData?.DOJ);
      await setSafeItem('ResidentialAddress', teacherData?.ResidentialAddress);
      await setSafeItem('MobileNo', teacherData?.MobileNo);
      await setSafeItem('EmpCategory', teacherData?.EmpCategory);
      await setSafeItem('Gender', teacherData?.Gender);
      await setSafeItem('response', teacherData?.response);
      await setSafeItem('Session', teacherData?.Session);
      await setSafeItem('image', teacherData?.image || 'No');
      await setSafeItem('profil_pic', teacherData?.profil_pic);
      await setSafeItem('BranchId', teacherData?.BranchId);
      await setSafeItem('branchName', teacherData?.branchName);
      await setSafeItem('SectionName', teacherData?.SectionName);
      await setSafeItem('SectionId', teacherData?.SectionId);
      await setSafeItem('Classid', teacherData?.Classid);
      await setSafeItem('ClassName', teacherData?.ClassName);

      console.log('==============================');
      console.log('ASYNC STORAGE SAVE COMPLETE ✅');

      const savedTeacherData = await AsyncStorage.getItem('teacherData');
      const savedName = await AsyncStorage.getItem('name');
      const savedDesignation = await AsyncStorage.getItem('DesignationName');
      const savedBranch = await AsyncStorage.getItem('branchName');
      const savedEmpCode = await AsyncStorage.getItem('EmpCode');
      const savedImage = await AsyncStorage.getItem('image');
      const savedProfilePic = await AsyncStorage.getItem('profil_pic');

      console.log('teacherData =>', savedTeacherData);
      console.log('name =>', savedName);
      console.log('DesignationName =>', savedDesignation);
      console.log('branchName =>', savedBranch);
      console.log('EmpCode =>', savedEmpCode);
      console.log('image =>', savedImage);
      console.log('profil_pic =>', savedProfilePic);
      console.log('==============================');

      return true;
    } catch (error) {
      console.log('SAVE STORAGE ERROR =>', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter username');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      formData.append('password', password);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const text = await response.text();

      console.log('==============================');
      console.log('RAW API RESPONSE =>');
      console.log(text);

      const data = JSON.parse(text);

      console.log('==============================');
      console.log('PARSED LOGIN DATA =>');
      console.log(data);

      if (data?.response === 'Logged') {
        console.log('==============================');
        console.log('LOGIN SUCCESS');

        const isSaved = await saveTeacherData(data);

        if (!isSaved) {
          Alert.alert('Error', 'Data save nahi hua');
          return;
        }

        const teacherData = await AsyncStorage.getItem('teacherData');

        if (teacherData) {
          console.log('teacherData SAVE HO GYA ✅');
          console.log('teacherData =>', teacherData);
        } else {
          console.log('teacherData SAVE NAHI HUA ❌');
          Alert.alert('Error', 'AsyncStorage save failed');
          return;
        }

        await login(data);
      } else {
        console.log('LOGIN FAILED');
        Alert.alert('Login Failed', data?.message || 'Invalid credentials');
      }
    } catch (error) {
      console.log('LOGIN ERROR =>', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#0A10A5', '#F2F2FA']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.topBg}
      />

      <LinearGradient
        colors={['#F2F2FA', '#B8F0B3', '#16DA05']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.bottomBg}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formBox}>
          <Image
            source={require('../../assets/images/logoAndroid.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.inputWrapper}>
            <User size={26} color="#222" strokeWidth={2.2} />
            <TextInput
              placeholder="User Name"
              placeholderTextColor="#333"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <KeyRound size={24} color="#222" strokeWidth={2.2} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#333"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            style={({pressed}) => [
              styles.loginBtn,
              pressed && {opacity: 0.9},
            ]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log In</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2FA',
  },

  topBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '78%',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  bottomBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 205,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  formBox: {
    marginTop: 10,
    alignItems: 'center',
  },

  logo: {
    width: 160,
    height: 160,
    marginBottom: 50,
  },

  inputWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 24,
  },

  input: {
    flex: 1,
    fontSize: 18,
    color: '#111',
  },

  loginBtn: {
    width: '100%',
    height: 56,
    borderRadius: 32,
    backgroundColor: '#F44343',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});