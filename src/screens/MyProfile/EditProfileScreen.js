import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function EditProfileScreen({navigation}) {
  const [name, setName] = useState('Vipan Sharma');
  const [mobile, setMobile] = useState('9876543210');
  const [address, setAddress] = useState('vpo dehri, distt kangra');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="My Profile" onBack={() => navigation.goBack()} backgroundColor="#1686C7" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topCurveWrap}>
            <View style={styles.topCurve} />
          </View>

          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/images/avatar-boy.png')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.smallEdit}>
              <Text style={styles.smallEditText}>✎</Text>
            </TouchableOpacity>
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

            <TouchableOpacity style={styles.updateBtn}>
              <Text style={styles.updateText}>Update</Text>
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
      <Text style={styles.label}>{label} <Text style={{color: 'red'}}>*</Text></Text>
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
  smallEdit: {
    position: 'absolute',
    right: 140,
    top: 58,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1693E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallEditText: {
    color: '#1693E7',
    fontSize: 13,
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