import React from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {Frown, Smile} from 'lucide-react-native';
import DisciplineHeader from './DisciplineHeader';
import {disciplineStyles as styles} from './DisciplineStyles';

function FeedbackTypeCard({label, type, Icon, navigation}) {
  return (
    <TouchableOpacity
      style={styles.typeCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('DisciplineFeedbackScreen', {feedbackType: type})
      }>
      <View style={styles.faceCircle}>
        <Icon size={41} color="#7A5420" strokeWidth={2.7} />
      </View>
      <Text style={styles.typeLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DisciplineScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <DisciplineHeader title="Discipline" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.page}>
        <View style={styles.chooseContent}>
          <Text style={styles.schoolName}>Him Academy Public School</Text>
          <Text style={styles.schoolCity}>Hiranagar</Text>
          <Text style={styles.chooseTitle}>Choose Your Feedback Type</Text>

          <View style={styles.typeRow}>
            <FeedbackTypeCard
              label="Smiley"
              type="Smiley"
              Icon={Smile}
              navigation={navigation}
            />
            <FeedbackTypeCard
              label="Frowny"
              type="Frowny"
              Icon={Frown}
              navigation={navigation}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
