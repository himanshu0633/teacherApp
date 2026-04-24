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

export default function SportsEntryScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Sports Entry"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
          rightIcon={
            <TouchableOpacity onPress={() => navigation.navigate('SportsEntryListScreen')}>
              <Text style={styles.eyeIcon}>◎</Text>
            </TouchableOpacity>
          }
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <SearchBox />

          <StudentDetail />

          <AddDetail
            firstLabel="Sports Name"
            awardLabel="Award/Participate"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SearchBox() {
  return (
    <>
      <View style={styles.inputBox}>
        <Text style={styles.smallLabel}>Admission No</Text>
        <TextInput value="112089" style={styles.input} />
      </View>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.inputBox}>
        <TextInput placeholder="Student Name" placeholderTextColor="#222" style={styles.input} />
      </View>

      <TouchableOpacity style={styles.searchBtn}>
        <Text style={styles.btnText}>Search</Text>
      </TouchableOpacity>
    </>
  );
}

function StudentDetail() {
  return (
    <View style={styles.studentCard}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Student Detail</Text>
      </View>

      <View style={styles.detailBody}>
        <View style={styles.row}>
          <Info label="Class" value="8th" />
          <Info label="Student Name" value="Malvika Sharma" />
        </View>

        <View style={styles.row}>
          <Info label="Father’s Name" value="Vipan Sharma" />
          <Info label="Phone no." value="9876543210" />
        </View>

        <View style={styles.addressBox}>
          <Text style={styles.addressTitle}>Address</Text>
          <Text style={styles.addressText}>Vill. Dhakawa P.O. Jhiralri</Text>
        </View>
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoCol}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function AddDetail({firstLabel, awardLabel}) {
  return (
    <View style={styles.addCard}>
      <View style={styles.addHead}>
        <Text style={styles.sectionTitle}>Add Detail</Text>
      </View>

      <View style={styles.addBody}>
        <SelectBox label={firstLabel} />
        <SelectBox label="Level" />
        <InputBox label="Year" />
        <InputBox label={awardLabel} />
        <DescriptionBox />
        <SelectBox label="Category" />

        <TouchableOpacity style={styles.uploadBox}>
          <Text style={styles.uploadText}>Upload doc/image</Text>
          <View style={styles.plusBox}>
            <Text style={styles.plus}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SelectBox({label}) {
  return (
    <TouchableOpacity style={styles.fieldBox}>
      <Text style={styles.fieldText}>{label}</Text>
      <Text style={styles.down}>⌄</Text>
    </TouchableOpacity>
  );
}

function InputBox({label}) {
  return (
    <View style={styles.fieldBox}>
      <TextInput placeholder={label} placeholderTextColor="#222" style={styles.fieldInput} />
    </View>
  );
}

function DescriptionBox() {
  return (
    <View style={styles.descBox}>
      <TextInput
        placeholder="Description"
        placeholderTextColor="#222"
        multiline
        style={styles.descInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 27, paddingBottom: 34},
  eyeIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#fff',
    color: '#F124B8',
    fontSize: 25,
    textAlign: 'center',
    lineHeight: 30,
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  smallLabel: {fontSize: 9, color: '#777'},
  input: {padding: 0, fontSize: 14, color: '#222'},
  orText: {textAlign: 'center', fontSize: 10, color: '#222', marginVertical: 10},
  searchBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 21,
    marginBottom: 27,
  },
  btnText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  studentCard: {
    borderWidth: 1,
    borderColor: '#BFE3F9',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#F4FCFF',
    marginBottom: 24,
  },
  sectionHead: {
    height: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#D8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {fontSize: 14, fontWeight: '800', color: '#222'},
  detailBody: {padding: 15},
  row: {flexDirection: 'row', marginBottom: 14},
  infoCol: {flex: 1},
  infoLabel: {fontSize: 12, color: '#777', marginBottom: 6},
  infoValue: {fontSize: 14, color: '#222', fontWeight: '800'},
  addressBox: {
    backgroundColor: '#DFF2FC',
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  addressTitle: {fontSize: 12, color: '#222', fontWeight: '700', marginBottom: 8},
  addressText: {fontSize: 11, color: '#222'},
  addCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  addHead: {
    height: 34,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBody: {paddingHorizontal: 13, paddingTop: 21, paddingBottom: 18},
  fieldBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: {fontSize: 14, color: '#222'},
  fieldInput: {flex: 1, padding: 0, fontSize: 14, color: '#222'},
  down: {fontSize: 22, color: '#222', marginTop: -5},
  descBox: {
    height: 100,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  descInput: {padding: 0, fontSize: 14, color: '#222', textAlignVertical: 'top'},
  uploadBox: {
    height: 77,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 33,
    paddingHorizontal: 16,
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
  submitBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});