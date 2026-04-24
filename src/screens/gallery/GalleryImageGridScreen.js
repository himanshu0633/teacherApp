import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function GalleryImageGridScreen({navigation}) {
  const images = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
  ];

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
          <Text style={styles.title}>Earth Day Activity</Text>
          <Text style={styles.date}>09-07-2025</Text>

          <View style={styles.grid}>
            {images.map((img, index) => (
              <Image key={index} source={{uri: img}} style={styles.image} />
            ))}
          </View>
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