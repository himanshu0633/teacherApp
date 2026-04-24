import React, {useState} from 'react';
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

export default function HomeworkAssignmentScreen({navigation}) {
  const [tab, setTab] = useState('homework');

  const isHomework = tab === 'homework';

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Homework / Assignment"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabBtn, isHomework && styles.activeTab]}
                onPress={() => setTab('homework')}>
                <Text style={[styles.tabIcon, isHomework && styles.activeText]}>
                  📝
                </Text>
                <Text style={[styles.tabText, isHomework && styles.activeText]}>
                  Home Work
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, !isHomework && styles.activeTab]}
                onPress={() => setTab('assignment')}>
                <Text style={[styles.tabIcon, !isHomework && styles.activeText]}>
                  🗒️
                </Text>
                <Text style={[styles.tabText, !isHomework && styles.activeText]}>
                  Assignment
                </Text>
              </TouchableOpacity>
            </View>

            <SelectBox label="Class" />
            <SelectBox label="Section" />
            <SelectBox label="Subject" />

            <View style={styles.inputBox}>
              <Text style={styles.smallLabel}>Due Date <Text style={styles.star}>*</Text></Text>
              <TextInput value="12-08-2023" style={styles.input} />
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.smallLabel}>Description <Text style={styles.star}>*</Text></Text>
              <TextInput
                value="write here..."
                multiline
                style={styles.descriptionInput}
              />
            </View>

            {!isHomework && (
              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadText}>Upload doc/image</Text>
                <View style={styles.plusBox}>
                  <Text style={styles.plus}>+</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.sendBtn}>
              <Text style={styles.sendText}>
                {isHomework ? 'Send Homework' : 'Send Assignment'}
              </Text>
            </TouchableOpacity>

         <TouchableOpacity
  style={styles.historyBtn}
  onPress={() =>
    navigation.navigate('AssignmentHistoryScreen', {
      type: isHomework ? 'homework' : 'assignment',
    })
  }>
  <Text style={styles.historyText}>
    View {isHomework ? 'Homework' : 'Assignment'} History
  </Text>
</TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SelectBox({label}) {
  return (
    <TouchableOpacity style={styles.selectBox}>
      <Text style={styles.selectText}>
        {label} <Text style={styles.star}>*</Text>
      </Text>
      <Text style={styles.arrow}>⌄</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#5A33C5',
  },
  topSafe: {
    backgroundColor: '#5A33C5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 30,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 6,
  },
  tabBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0B9BEF',
    borderColor: '#0B9BEF',
  },
  tabIcon: {
    fontSize: 19,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  activeText: {
    color: '#fff',
  },
  selectBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: '#222',
  },
  star: {
    color: 'red',
  },
  arrow: {
    fontSize: 22,
    color: '#222',
    marginTop: -6,
  },
  inputBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 16,
  },
  smallLabel: {
    fontSize: 9,
    color: '#888',
  },
  input: {
    padding: 0,
    margin: 0,
    fontSize: 14,
    color: '#222',
  },
  descriptionBox: {
    height: 94,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 9,
    marginBottom: 18,
  },
  descriptionInput: {
    padding: 0,
    marginTop: 2,
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 78,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {
    fontSize: 14,
    color: '#222',
  },
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
  plus: {
    fontSize: 42,
    color: 'red',
    lineHeight: 42,
  },
  sendBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  historyBtn: {
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  historyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
});