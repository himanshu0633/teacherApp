import React from 'react';
import SportsEntryScreen from './SportsEntryScreen';

export default function ActivityEntryScreen(props) {
  return (
    <SportsEntryScreen
      {...props}
      title="Activity Entry"
      listRoute="ActivityEntryListScreen"
      firstLabel="Activity Name"
      awardLabel="Prize Won"
      entryType="activity"
    />
  );
}
