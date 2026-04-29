import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  Eye,
  FileText,
  Link2,
  User,
} from 'lucide-react-native';
import {PURPLE, TEXT, circularStyles as styles} from './circularStyles';

export function CircularHeader({title, onBack, rightAction}) {
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
        <View style={styles.headerButton}>
          {rightAction ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={rightAction}
              style={styles.statusShortcut}
              activeOpacity={0.75}>
              <CheckCheck size={24} color="#EC008C" strokeWidth={2.4} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

export function CircularTabs({active, onCreate, onList}) {
  const tabs = [
    {key: 'create', label: 'Create Circular', Icon: FileText, onPress: onCreate},
    {key: 'list', label: 'View Circulars', Icon: Eye, onPress: onList},
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map(({key, label, Icon, onPress}) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            accessibilityRole="button"
            onPress={onPress}
            style={[styles.tabButton, isActive && styles.activeTab]}
            activeOpacity={0.8}>
            <Icon
              size={19}
              color={isActive ? '#fff' : TEXT}
              strokeWidth={isActive ? 2.3 : 2}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AttachmentButton() {
  return (
    <TouchableOpacity style={styles.attachmentRow} activeOpacity={0.75}>
      <View style={styles.attachmentIcon}>
        <Link2 size={21} color={TEXT} strokeWidth={2.2} />
      </View>
      <Text style={styles.attachmentText}>View Attachment</Text>
    </TouchableOpacity>
  );
}

export function CircularCard({item, onPress}) {
  return (
    <TouchableOpacity
      style={styles.circularCard}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.cardTitleBar}>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaColumn}>
            <View style={styles.metaLabelRow}>
              <Clock3 size={12} color="#22B63A" strokeWidth={2} />
              <Text style={styles.metaLabel}>Circular Date</Text>
            </View>
            <Text style={styles.metaValue}>{item.date}</Text>
          </View>
          <View style={styles.metaColumn}>
            <View style={styles.metaLabelRow}>
              <User size={12} color="#22B63A" strokeWidth={2} />
              <Text style={styles.metaLabel}>Circular By</Text>
            </View>
            <Text style={styles.metaValue}>{item.by}</Text>
          </View>
        </View>
        <AttachmentButton />
      </View>
    </TouchableOpacity>
  );
}
