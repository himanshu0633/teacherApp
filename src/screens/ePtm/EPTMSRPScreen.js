import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronDown, Eye, Radio} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const PURPLE = '#5A33C5';
const TEXT = '#202124';

function RequiredLabel({children, small}) {
  return (
    <Text style={small ? styles.smallInputLabel : styles.inputLabel}>
      {children}
      <Text style={styles.required}> *</Text>
    </Text>
  );
}

function RadioOption({label, selected, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.radioOption}
      onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function EPTMSRPScreen({navigation}) {
  const [mode, setMode] = useState('Online');
  const [date, setDate] = useState('12-08-2023');
  const [searchText, setSearchText] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [description, setDescription] = useState('write here...');

  const handleSubmit = () => {
    Alert.alert('E-PTM SPR', 'Form submitted successfully.');
  };

  const handleSelect = field => {
    Alert.alert('Select', `${field} dropdown will open here.`);
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="E-PTM SPR"
        onBack={() => navigation.goBack()}
        rightIcon={
          <View style={styles.eyeButton}>
            <Eye size={20} color="#FF1493" strokeWidth={2.2} />
          </View>
        }
        rightAction={() => navigation.navigate('EPtmRecordScreen')}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inputBox}>
            <RequiredLabel small>Date</RequiredLabel>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholderTextColor="#777"
            />
          </View>

          <View style={styles.modeRow}>
            <Text style={styles.modeText}>
              Mode<Text style={styles.required}> *</Text>
            </Text>
            <RadioOption
              label="Online"
              selected={mode === 'Online'}
              onPress={() => setMode('Online')}
            />
            <RadioOption
              label="Offline"
              selected={mode === 'Offline'}
              onPress={() => setMode('Offline')}
            />
          </View>

          <View style={styles.inputBox}>
            <RequiredLabel>Search by Name / Adm No.</RequiredLabel>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              style={styles.input}
              placeholderTextColor="#777"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.searchButton}
            onPress={() => Alert.alert('Search', 'Student search complete.')}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>

          <View style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <Text style={styles.studentName}>Malvika Sharma</Text>
              <View style={styles.studentCheck}>
                <Radio size={17} color="#BDE6FA" strokeWidth={1.8} />
              </View>
            </View>

            <View style={styles.studentGrid}>
              <View style={styles.studentCell}>
                <Text style={styles.studentLabel}>Admission No.</Text>
                <Text style={styles.studentValue}>113245</Text>
              </View>
              <View style={styles.studentCell}>
                <Text style={styles.studentLabel}>Class</Text>
                <Text style={styles.studentValue}>UKG</Text>
              </View>
              <View style={styles.studentCell}>
                <Text style={styles.studentLabel}>Section</Text>
                <Text style={styles.studentValue}>Rose</Text>
              </View>
              <View style={styles.studentCell}>
                <Text style={styles.studentLabel}>Roll No.</Text>
                <Text style={styles.studentValue}>123</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputBox}>
            <RequiredLabel>Mobile Number</RequiredLabel>
            <TextInput
              value={mobileNo}
              onChangeText={setMobileNo}
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor="#777"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() => handleSelect('Talk With')}>
            <RequiredLabel>Talk With</RequiredLabel>
            <ChevronDown size={19} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.descriptionBox}>
            <RequiredLabel small>Description</RequiredLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              style={styles.descriptionInput}
              placeholderTextColor="#777"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() => handleSelect('Parent Satisfaction')}>
            <RequiredLabel>Parent Satisfaction</RequiredLabel>
            <ChevronDown size={19} color={TEXT} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.submitButton}
            onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 42,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 17,
  },
  inputLabel: {
    color: TEXT,
    fontSize: 14,
  },
  smallInputLabel: {
    color: '#6D7179',
    fontSize: 11,
  },
  required: {
    color: '#FF0808',
  },
  input: {
    color: TEXT,
    fontSize: 14,
    padding: 0,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  modeText: {
    color: TEXT,
    fontSize: 14,
    marginRight: 18,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  radioOuter: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1,
    borderColor: '#C9C9C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  radioOuterActive: {
    borderColor: PURPLE,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: PURPLE,
  },
  radioLabel: {
    color: TEXT,
    fontSize: 14,
  },
  searchButton: {
    height: 45,
    borderRadius: 6,
    backgroundColor: '#119BE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  studentCard: {
    borderWidth: 1,
    borderColor: '#BDE6FA',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 21,
    overflow: 'hidden',
  },
  studentHeader: {
    height: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#D4E7F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  studentName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  studentCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 2,
  },
  studentCell: {
    width: '50%',
    marginBottom: 14,
  },
  studentLabel: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 5,
  },
  studentValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  selectBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  descriptionBox: {
    height: 94,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 7,
    paddingHorizontal: 15,
    paddingTop: 8,
    marginBottom: 16,
  },
  descriptionInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    padding: 0,
  },
  submitButton: {
    height: 46,
    borderRadius: 6,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
