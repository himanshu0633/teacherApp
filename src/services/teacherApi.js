import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {API_ENDPOINTS, BASE_URL} from '../utils/constants';

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(`${endpoint} JSON PARSE ERROR =>`, error);
    console.log(`${endpoint} RAW RESPONSE =>`, text);
    return null;
  }
};

export const getFirebaseDeviceToken = async () => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
      await messaging().registerDeviceForRemoteMessages();
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    return await messaging().getToken();
  } catch (error) {
    console.log('FIREBASE TOKEN ERROR =>', error);
    return '';
  }
};

export const sendTeacherFirebaseToken = async empCode => {
  if (!empCode) {
    return null;
  }

  const token = await getFirebaseDeviceToken();

  if (!token) {
    return null;
  }

  return postForm(API_ENDPOINTS.TEACHER_TOKEN, {
    empcode: empCode,
    token,
  });
};

export const updateTeacherLogin = empCode => {
  return postForm(API_ENDPOINTS.UPDATE_LOGIN, {
    empcode: empCode,
  });
};

export const getAttendanceCount = ({empCode, sessionId, branchId}) => {
  return postForm(API_ENDPOINTS.COUNT_ATTENDANCE, {
    empcode: empCode,
    SessionId: sessionId,
    BranchId: branchId,
  });
};

const teacherApi = {
  getAttendanceCount,
  getFirebaseDeviceToken,
  sendTeacherFirebaseToken,
  updateTeacherLogin,
};

export default teacherApi;
