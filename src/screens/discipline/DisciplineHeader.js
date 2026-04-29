import React from 'react';
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {PURPLE, disciplineStyles as styles} from './DisciplineStyles';

export default function DisciplineHeader({title, onBack}) {
  return (
    <SafeAreaView style={styles.headerSafe}>
      <StatusBar backgroundColor={PURPLE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onBack}
          style={styles.headerButton}
          activeOpacity={0.75}>
          <ArrowLeft size={22} color="#fff" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerButton} />
      </View>
    </SafeAreaView>
  );
}
