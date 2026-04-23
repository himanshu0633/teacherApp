import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';

export default function CommonHeader({
  title,
  onBack,
  rightIcon = null,
  rightAction,
  backgroundColor = '#5A33C5',
  showBack = true,
}) {
  return (
    <View style={[styles.header, {backgroundColor}]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="light-content"
      />

      <TouchableOpacity
        onPress={() => {
          if (showBack && onBack) {
            onBack();
          }
        }}
        style={styles.sideBtn}
        disabled={!showBack}>
        {showBack ? <Text style={styles.backIcon}>←</Text> : <View />}
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={rightAction} style={styles.sideBtn}>
        {rightIcon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  sideBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 28 / 1.6,
    fontWeight: '700',
    marginLeft: 10,
  },
});