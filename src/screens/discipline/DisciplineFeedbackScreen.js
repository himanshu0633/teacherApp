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
import {Check, ChevronDown} from 'lucide-react-native';
import DisciplineHeader from './DisciplineHeader';
import {TEXT, disciplineStyles as styles} from './DisciplineStyles';

function SelectInput({placeholder}) {
  return (
    <TouchableOpacity style={styles.input} activeOpacity={0.75}>
      <Text style={{color: TEXT, fontSize: 14}}>{placeholder}</Text>
      <ChevronDown size={19} color={TEXT} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function DisciplineFeedbackScreen({navigation}) {
  const handleSubmit = () => {
    Alert.alert('Success', 'Feedback submitted successfully.');
  };

  return (
    <View style={styles.wrapper}>
      <DisciplineHeader title="Discipline" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.input}
            placeholder="Search by Name/Adm No."
            placeholderTextColor={TEXT}
          />

          <Text style={styles.orText}>OR</Text>

          <SelectInput placeholder="Search by Class Section" />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.searchButton]}
              activeOpacity={0.82}>
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              activeOpacity={0.82}>
              <Text style={styles.actionText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <Text style={styles.studentName}>Malvika Sharma</Text>
              <View style={styles.checkCircle}>
                <Check size={14} color="#B9DFF2" strokeWidth={2.2} />
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

          <View style={styles.submitPanel}>
            <View style={styles.panelInput}>
              <SelectInput placeholder="Choose Parameter" />
            </View>
            <TextInput
              style={[styles.input, styles.panelInput]}
              placeholder="Add Other Parameter"
              placeholderTextColor={TEXT}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.82}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
