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

export default function ApplyLeaveScreen({navigation}) {
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('28-07-2023');
  const [toDate, setToDate] = useState('');
  const [halfDay, setHalfDay] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
     
<CommonHeader
  title="Apply Leave"
  onBack={() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MyProfileScreen');
    }
  }}
  backgroundColor="#5A33C5"
/>
        <ScrollView contentContainerStyle={styles.content}>
          <Input label="Leave Type" value={leaveType} placeholder="Select leave type" isDropdown />
          <Input label="From Date" value={fromDate} onChangeText={setFromDate} />
          <Input label="To Date" value={toDate} onChangeText={setToDate} />
          <Input label="Full/HalfDay" value={halfDay} placeholder="Select" isDropdown />
          <Input label="No. Of Day(s)" value={days} onChangeText={setDays} />
          <Input
            label="Reason"
            value={reason}
            onChangeText={setReason}
            multiline
            inputStyle={{height: 100, textAlignVertical: 'top'}}
          />

          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Apply Leave</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder = '',
  multiline = false,
  inputStyle = {},
  isDropdown = false,
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>
        {label} <Text style={{color: 'red'}}>*</Text>
      </Text>

      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline={multiline}
          editable={!isDropdown}
          style={[styles.input, inputStyle]}
        />
        {isDropdown ? <Text style={styles.dropdown}>⌄</Text> : null}
      </View>
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
  inputBox: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#F3F3F3',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 12,
    fontSize: 16,
    color: '#222',
  },
  dropdown: {
    fontSize: 20,
    color: '#444',
    marginTop: 8,
  },
  btn: {
    marginTop: 12,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});