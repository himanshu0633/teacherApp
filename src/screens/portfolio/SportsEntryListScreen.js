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

export default function SportsEntryListScreen({navigation}) {
  return (
    <EntryListScreen
      navigation={navigation}
      title="Sports Entry List"
      awardLabel="Achievement/Award"
      activityLabel="Activity"
      activityValue="Badminton"
    />
  );
}

export function EntryListScreen({
  navigation,
  title,
  awardLabel,
  activityLabel,
  activityValue,
}) {
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
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.name}>Malvika Sharma</Text>
              <TouchableOpacity>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <Info label="Adm No." value="112089" />
              <Info label="Year" value="2022" />
              <Info label={awardLabel} value="First" />
              <Info label="Level" value="Zonal Level" />
              <Info label="Category" value="Achievement" />
              <Info label={activityLabel} value={activityValue} />
              <Info label="Updated On" value="31-07-2023" />

              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. At ille
                pellit
              </Text>

              <Text style={styles.imageTitle}>Images</Text>

              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200',
                }}
                style={styles.thumb}
              />
            </View>
          </View>
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

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30},
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardHead: {
    height: 34,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {fontSize: 14, color: '#0098EE', fontWeight: '800'},
  delete: {fontSize: 18, color: 'red'},
  body: {paddingHorizontal: 15, paddingTop: 16, paddingBottom: 16},
  infoRow: {flexDirection: 'row', marginBottom: 10},
  label: {width: '54%', fontSize: 13, color: '#222', fontWeight: '800'},
  value: {flex: 1, fontSize: 13, color: '#777'},
  descTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    color: '#222',
    fontWeight: '800',
  },
  descText: {fontSize: 12, color: '#777', lineHeight: 16, marginBottom: 15},
  imageTitle: {fontSize: 13, color: '#222', fontWeight: '800', marginBottom: 10},
  thumb: {width: 66, height: 50, borderRadius: 7, resizeMode: 'cover'},
});