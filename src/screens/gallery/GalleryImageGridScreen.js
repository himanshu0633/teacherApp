import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const getTeacherContext = async () => {
  const [saved, branchId, sessionId, session, empCode] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
    AsyncStorage.getItem('EmpCode'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
  };
};

export default function GalleryImageGridScreen({navigation, route}) {
  const {id, title = 'Gallery Images', date = ''} = route?.params || {};
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadImages = useCallback(async () => {
    if (!id) {
      setImages([]);
      return;
    }

    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        id,
      };

      console.log('CLASS GALLERY GRID PAYLOAD =>', payload);
      const data = await postForm(
        API_ENDPOINTS.VIEW_CLASS_GALLERY_CATEGORY_IMAGES,
        payload,
      );
      console.log('CLASS GALLERY GRID RESPONSE =>', data);

      if (data?.status === true || String(data?.status).toLowerCase() === 'true') {
        setImages(data?.categoryImages || data?.response || []);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.log('CLASS GALLERY GRID ERROR =>', error);
      Alert.alert('Error', 'Gallery images could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="View Class Gallery Images"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date || '-'}</Text>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color="#5A33C5" />
            </View>
          ) : images.length ? (
            <View style={styles.grid}>
              {images.map((item, index) => (
                <Image
                  key={`${item.image || index}`}
                  source={{uri: item.image || item}}
                  style={styles.image}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No images found.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 23, paddingTop: 24, paddingBottom: 30},
  title: {
    textAlign: 'center',
    fontSize: 18,
    color: '#222',
    fontWeight: '900',
  },
  date: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    marginBottom: 30,
  },
  centerBox: {paddingVertical: 40, alignItems: 'center'},
  emptyBox: {
    minHeight: 110,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {fontSize: 13, color: '#777', textAlign: 'center'},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: '47%',
    height: 99,
    borderRadius: 4,
    resizeMode: 'cover',
    marginBottom: 22,
  },
});
