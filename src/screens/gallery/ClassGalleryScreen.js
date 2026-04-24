import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function ClassGalleryScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Class Gallery"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.schoolName}>ASHIANA PUBLIC SCHOOL, CHANDIGARH</Text>

          <MenuCard
            title="Class Gallery Category"
            icon="https://cdn-icons-png.flaticon.com/512/3767/3767084.png"
            onPress={() => navigation.navigate('CreateClassGalleryCategoryScreen')}
          />

          <MenuCard
            title="Class Gallery Images"
            icon="https://cdn-icons-png.flaticon.com/512/2659/2659360.png"
            onPress={() => navigation.navigate('ClassGalleryImagesScreen')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function MenuCard({title, icon, onPress}) {
  return (
    <TouchableOpacity style={styles.menuCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{uri: icon}} style={styles.menuIcon} />
      <Text style={styles.menuText}>{title}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 27, paddingTop: 34},
  schoolName: {
    textAlign: 'center',
    color: '#0098EE',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 28,
  },
  menuCard: {
    height: 58,
    borderRadius: 8,
    backgroundColor: '#ECECEC',
    marginBottom: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {width: 42, height: 42, resizeMode: 'contain', marginRight: 22},
  menuText: {flex: 1, fontSize: 15, color: '#222', fontWeight: '500'},
  arrow: {fontSize: 30, color: '#222', marginTop: -3},
});