import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function ChangePasswordScreen({navigation}) {
  const [oldPassword, setOldPassword] = useState('**********');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader
          title="Change Password"
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Input
            label="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Reset Password</Text>
          </TouchableOpacity>

          <Text style={styles.instructionTitle}>Instruction</Text>
          <View style={styles.line} />

          <Text style={styles.instruction}>
            1. Use a combination of lower case and upper case letters, numbers
            and special characters like ^,%!
          </Text>
          <Text style={styles.instruction}>
            2. Spaces are not allowed in between password.
          </Text>
          <Text style={styles.instruction}>
            3. The password should contain a minimum of 6 characters and
            maximum of 10 characters.
          </Text>
          <Text style={styles.instruction}>
            4. Your new password can not be same as any of your previous
            password.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Input({label, value, onChangeText, secureTextEntry}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>
        {label} <Text style={{color: 'red'}}>*</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  content: {
    padding: 22,
  },
  inputWrap: {
    marginBottom: 16,
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
  },
  btn: {
    marginTop: 10,
    backgroundColor: '#5A33C5',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionTitle: {
    marginTop: 56,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  line: {
    height: 1,
    backgroundColor: '#D2D2D2',
    marginTop: 14,
    marginBottom: 18,
  },
  instruction: {
    fontSize: 15,
    lineHeight: 24,
    color: '#222',
    marginBottom: 14,
  },
});