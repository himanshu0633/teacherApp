import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronDown, Plus} from 'lucide-react-native';
import {CircularHeader, CircularTabs} from './CircularComponents';
import {TEXT, circularStyles as styles} from './circularStyles';

function RequiredLabel({children}) {
  return (
    <Text>
      {children}
      <Text style={styles.required}>*</Text>
    </Text>
  );
}

function SelectField({placeholder}) {
  return (
    <TouchableOpacity style={styles.field} activeOpacity={0.75}>
      <Text style={styles.fieldText}>
        <RequiredLabel>{placeholder}</RequiredLabel>
      </Text>
      <ChevronDown size={19} color={TEXT} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function EmployeeCircularScreen({navigation}) {
  const handleSubmit = () => {
    Alert.alert('Success', 'Circular submitted successfully.');
  };

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="Employee Circular"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <CircularTabs
          active="create"
          onCreate={() => {}}
          onList={() => navigation.navigate('MyCircularListScreen')}
        />

        <ScrollView
          contentContainerStyle={styles.createContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.field, styles.dateField]}>
            <Text style={styles.dateLabel}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.dateValue}>31-07-2023</Text>
          </View>

          <TextInput
            style={styles.field}
            placeholder="Circular Name *"
            placeholderTextColor={TEXT}
          />

          <SelectField placeholder="Employee Type " />
          <SelectField placeholder="Select Branch " />
          <SelectField placeholder="Choose Staff " />

          <View style={styles.uploadField}>
            <Text style={styles.uploadText}>Upload File</Text>
            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.75}>
              <Plus size={42} color="#FF0712" strokeWidth={1.9} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.82}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
