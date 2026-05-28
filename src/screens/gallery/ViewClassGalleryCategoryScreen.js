import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
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

export default function ViewClassGalleryCategoryScreen({navigation}) {
  return (
    <ListScreen
      navigation={navigation}
      title="View Class Gallery Category"
      type="category"
    />
  );
}

export function ListScreen({navigation, title, type}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
      };

      console.log('CLASS GALLERY VIEW PAYLOAD =>', payload);
      const data = await postForm(
        API_ENDPOINTS.VIEW_CLASS_GALLERY_CATEGORY_IMAGE,
        payload,
      );
      console.log('CLASS GALLERY VIEW RESPONSE =>', data);

      if (data?.status === true || String(data?.status).toLowerCase() === 'true') {
        setRows(data?.response || []);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.log('CLASS GALLERY VIEW ERROR =>', error);
      Alert.alert('Error', 'Class gallery list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRows);
    return unsubscribe;
  }, [loadRows, navigation]);

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title={title}
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color="#5A33C5" />
            </View>
          ) : rows.length ? (
            rows.map((item, index) => (
              <GalleryCard
                key={`${item.categoryid || index}`}
                item={item}
                index={index}
                type={type}
                navigation={navigation}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No class gallery data found.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GalleryCard({item, index, type, navigation}) {
  const images = item?.categoryImages || [];
  const previewImages = images.slice(0, 3);
  const count = Number(item?.imageCount || images.length || 0);
  const openGalleryImages = () => {
    navigation.navigate('GalleryImageGridScreen', {
      id: item.categoryid,
      title: item.categoryName,
      date: item.date,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.idText}>#{String(index + 1).padStart(2, '0')}</Text>
      </View>

      <View style={styles.body}>
        <Info label="Date" value={item?.date || '-'} />
        <Info label="Class" value={item?.className || '-'} />
        <Info label="Category Name" value={item?.categoryName || '-'} />

        <Text style={styles.imageLabel}>
          {type === 'images' ? 'Gallery Images' : 'Category Image'}
        </Text>

        {images.length ? (
          <View style={styles.galleryRow}>
            {(type === 'images' ? previewImages : images.slice(0, 1)).map(
              (image, imgIndex) => (
                <Thumb key={`${image.image}-${imgIndex}`} uri={image.image} />
              ),
            )}

            {type === 'images' && count > previewImages.length ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.viewMoreButton}
                onPress={openGalleryImages}>
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <Text style={styles.noImageText}>No image</Text>
        )}
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Thumb({uri}) {
  return <Image source={{uri}} style={styles.thumb} />;
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30},
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
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardHead: {
    height: 34,
    backgroundColor: '#F1F1F1',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idText: {fontSize: 14, color: '#0098EE', fontWeight: '800'},
  body: {paddingHorizontal: 15, paddingTop: 16, paddingBottom: 18},
  infoRow: {flexDirection: 'row', marginBottom: 10},
  label: {width: '46%', fontSize: 13, color: '#222', fontWeight: '800'},
  value: {flex: 1, fontSize: 13, color: '#777'},
  imageLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 12,
  },
  thumb: {width: 66, height: 50, borderRadius: 7, resizeMode: 'cover', marginRight: 8},
  galleryRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  viewMoreButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  noImageText: {fontSize: 12, color: '#777'},
});
