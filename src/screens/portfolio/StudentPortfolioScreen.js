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

export default function StudentPortfolioScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Student Portfolio"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.schoolName}>HIM ACADEMY SCHOOL, HIRANAGAR</Text>

          <MenuCard
            icon="https://cdn-icons-png.flaticon.com/512/857/857455.png"
            title="Sports Detail"
            onPress={() => navigation.navigate('SportsEntryScreen')}
          />

          <MenuCard
            icon="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
            title="Activity Detail"
            onPress={() => navigation.navigate('ActivityEntryScreen')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function MenuCard({icon, title, onPress}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image source={{uri: icon}} style={styles.icon} />
      <Text style={styles.cardText}>{title}</Text>
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
  card: {
    height: 58,
    borderRadius: 8,
    backgroundColor: '#ECECEC',
    marginBottom: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {width: 42, height: 42, resizeMode: 'contain', marginRight: 22},
  cardText: {flex: 1, fontSize: 15, color: '#222', fontWeight: '500'},
  arrow: {fontSize: 30, color: '#222', marginTop: -3},
});