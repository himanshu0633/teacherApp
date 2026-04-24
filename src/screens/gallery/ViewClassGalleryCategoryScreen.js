import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

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
  const rows = [
    {id: '#01', date: '09-07-2025', className: 'Class V', category: 'Earth Day Activity'},
    {id: '#02', date: '08-07-2025', className: 'Class VI', category: 'Bookmark Activity'},
  ];

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
          {rows.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.idText}>{item.id}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity>
                    <Text style={styles.edit}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.delete}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.body}>
                <Info label="Date" value={item.date} />
                <Info label="Class" value={item.className} />
                <Info label="Category Name" value={item.category} />

                <Text style={styles.imageLabel}>
                  {type === 'images' ? 'Gallery Images' : 'Category Image'}
                </Text>

                {type === 'images' ? (
                  <View style={styles.galleryRow}>
                    <Thumb />
                    <Thumb />
                    <TouchableOpacity
                      style={styles.moreThumb}
                      onPress={() => navigation.navigate('GalleryImageGridScreen')}>
                      <Thumb dark />
                      <Text style={styles.moreText}>+5</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Thumb />
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
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

function Thumb({dark}) {
  return (
    <Image
      source={{
        uri: dark
          ? 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300'
          : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300',
      }}
      style={[styles.thumb, dark && styles.darkThumb]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30},
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
  actions: {flexDirection: 'row', alignItems: 'center', gap: 18},
  edit: {fontSize: 20, color: '#29B842', fontWeight: '800'},
  delete: {fontSize: 18, color: '#FF3B4F'},
  body: {paddingHorizontal: 15, paddingTop: 16, paddingBottom: 18},
  infoRow: {flexDirection: 'row', marginBottom: 10},
  label: {width: '46%', fontSize: 13, color: '#222', fontWeight: '800'},
  value: {flex: 1, fontSize: 13, color: '#777'},
  imageLabel: {fontSize: 13, color: '#222', fontWeight: '800', marginTop: 2, marginBottom: 12},
  thumb: {width: 66, height: 50, borderRadius: 7, resizeMode: 'cover', marginRight: 8},
  darkThumb: {opacity: 0.7},
  galleryRow: {flexDirection: 'row'},
  moreThumb: {position: 'relative'},
  moreText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    alignSelf: 'center',
    top: 14,
  },
});