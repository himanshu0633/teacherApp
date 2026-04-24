import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function CreateClassGalleryCategoryScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Create Class Gallery Category"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <InputBox label="Date" value="09-07-2025" small />
          <SelectBox label="Select Class" value="Class V" />
          <InputBox label="Category Name" required />
          <UploadBox label="Category Image" />

          <View style={styles.bottom}>
            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => navigation.navigate('ViewClassGalleryCategoryScreen')}>
              <Text style={styles.viewText}>⊙  View Class Gallery Categories</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InputBox({label, value, small, required}) {
  return (
    <View style={styles.inputBox}>
      {small && (
        <Text style={styles.smallLabel}>
          {label} <Text style={styles.star}>*</Text>
        </Text>
      )}
      <TextInput
        value={value}
        placeholder={`${label}${required ? ' *' : ''}`}
        placeholderTextColor="#222"
        style={styles.input}
      />
    </View>
  );
}

function SelectBox({label, value}) {
  return (
    <TouchableOpacity style={styles.selectBox}>
      <View>
        <Text style={styles.smallLabel}>
          {label} <Text style={styles.star}>*</Text>
        </Text>
        <Text style={styles.selectText}>{value}</Text>
      </View>
      <Text style={styles.down}>⌄</Text>
    </TouchableOpacity>
  );
}

function UploadBox({label}) {
  return (
    <TouchableOpacity style={styles.uploadBox}>
      <Text style={styles.uploadText}>{label}</Text>
      <View style={styles.plusBox}>
        <Text style={styles.plus}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {flexGrow: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 34},
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  smallLabel: {fontSize: 9, color: '#777'},
  star: {color: 'red'},
  input: {padding: 0, fontSize: 14, color: '#222'},
  selectBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {fontSize: 14, color: '#222'},
  down: {fontSize: 22, color: '#222', marginTop: -5},
  uploadBox: {
    height: 77,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {fontSize: 14, color: '#222'},
  plusBox: {
    width: 60,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {fontSize: 42, color: 'red', lineHeight: 42},
  bottom: {marginTop: 'auto'},
  submitBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  viewBtn: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#0098EE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  viewText: {color: '#0098EE', fontSize: 16, fontWeight: '800'},
});