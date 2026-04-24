import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';

export default function PostSchoolDiaryScreen({ navigation }) {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Mock date picker – in real app use @react-native-community/datetimepicker
  const handleDatePress = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Select Date', 'Use date picker:', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Today', onPress: () => setDate(new Date().toLocaleDateString('en-GB')) },
      ]);
    } else {
      // For mobile, you would integrate DateTimePickerModal or similar
      Alert.alert('Date', 'Choose a date', [
        { text: 'Cancel', style: 'cancel' },
        { text: '2026-04-24', onPress: () => setDate('2026-04-24') },
        { text: '2026-04-25', onPress: () => setDate('2026-04-25') },
      ]);
    }
  };

  // Mock image picker
  const handleImagePick = () => {
    Alert.alert('Add Image', 'Choose source', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => Alert.alert('Camera', 'Feature coming soon') },
      { text: 'Gallery', onPress: () => setImageUri('https://picsum.photos/300/300?random=1') },
    ]);
  };

  const handleSubmit = () => {
    if (!date.trim()) {
      Alert.alert('Required', 'Please select a date');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter description');
      return;
    }
    Alert.alert('Success', 'School diary posted successfully');
    // Reset or navigate
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#292246" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backCircle}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post School Diary</Text>
        </View>
      </SafeAreaView>

      <ImageBackground
        source={{
        //   uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=900',
        }}
        style={styles.bg}
        imageStyle={styles.bgImage}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Date Field */}
            <Text style={styles.label}>Date <Text style={styles.star}>*</Text></Text>
            <TouchableOpacity style={styles.dateBox} onPress={handleDatePress}>
              <Text style={[styles.dateText, !date && styles.placeholder]}>
                {date || 'Select Date'}
              </Text>
              <Text style={styles.calIcon}>📅</Text>
            </TouchableOpacity>

            {/* Description Field */}
            <Text style={styles.label}>Description <Text style={styles.star}>*</Text></Text>
            <TextInput
              style={styles.descInput}
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
              placeholder="Write about today's activities, homework, or announcements..."
              placeholderTextColor="#aaa"
              textAlignVertical="top"
            />

            {/* Image Upload */}
            <Text style={styles.label}>Add Image</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <ImageBackground
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    imageStyle={{ borderRadius: 16 }}>
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setImageUri(null)}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </ImageBackground>
                </View>
              ) : (
                <>
                  <Text style={styles.plus}>+</Text>
                  <Text style={styles.uploadHint}>Tap to add image</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#red',
  },
  topSafe: {
    backgroundColor: '#4B46FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4B46FF',
  },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  bg: {
    // flex: 1,
  },
  bgImage: {
    // opacity: 0.12,
  },
  scrollContent: {
    // paddingHorizontal: 20,
    // paddingTop: 20,
    // paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    // borderRadius: 32,
    paddingHorizontal: 24,
    // paddingVertical: 32,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 10,
    marginTop: 8,
  },
  star: {
    color: '#FF5A5F',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    backgroundColor: '#FAFAFE',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: '#1E1E2F',
    fontWeight: '500',
  },
  placeholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  calIcon: {
    fontSize: 22,
  },
  descInput: {
    height: 140,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    fontSize: 16,
    color: '#1E1E2F',
    marginBottom: 24,
    backgroundColor: '#FAFAFE',
  },
  uploadBox: {
    width: '100%',
    height: 220,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    backgroundColor: '#F8FAFE',
    overflow: 'hidden',
  },
  plus: {
    fontSize: 56,
    color: '#4B46FF',
    fontWeight: '300',
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  removeImageBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
  },
  removeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitBtn: {
    height: 56,
    borderRadius: 30,
    backgroundColor: '#4B46FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B46FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});