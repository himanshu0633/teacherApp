import React from 'react';
import {EntryListScreen} from './SportsEntryListScreen';

export default function ActivityEntryListScreen({navigation}) {
  return (
    <EntryListScreen
      navigation={navigation}
      title="Activity Entry List"
      awardLabel="Prize Won"
      activityLabel="Activity"
      activityValue="Dance"
    />
  );
}