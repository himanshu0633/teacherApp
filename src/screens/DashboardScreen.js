import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, COLORS} from '../utils/constants';

export default function DashboardScreen() {
  const [name, setName] = useState('');

  useEffect(() => {
    const syncDashboardApis = async () => {
      try {
        const empcode = await AsyncStorage.getItem('empcode');
        const teacherName = await AsyncStorage.getItem('teacherName');
        setName(teacherName || 'Teacher');

        if (!empcode) {
          return;
        }

        const tokenForm = new FormData();
        tokenForm.append('empcode', empcode);

        const tokenRes = await fetch(`${BASE_URL}token_teacher.php`, {
          method: 'POST',
          headers: {'Content-Type': 'multipart/form-data'},
          body: tokenForm,
        });

        const tokenText = await tokenRes.text();
        const token = tokenText.trim().replace(/^"|"$/g, '');
        if (token) {
          await AsyncStorage.setItem('teacher_token', token);
        }

        const updateForm = new FormData();
        updateForm.append('empcode', empcode);

        await fetch(`${BASE_URL}updatelogin.php`, {
          method: 'POST',
          headers: {'Content-Type': 'multipart/form-data'},
          body: updateForm,
        });
      } catch (error) {
        console.log('[DASHBOARD] api sync error', error);
        Alert.alert('Warning', 'Dashboard sync failed.');
      }
    };

    syncDashboardApis();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    color: COLORS.darkText,
    fontWeight: '700',
  },
  name: {
    marginTop: 8,
    fontSize: 18,
    color: COLORS.text,
  },
});
