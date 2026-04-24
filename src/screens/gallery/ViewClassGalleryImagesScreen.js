import React from 'react';
import {ListScreen} from './ViewClassGalleryCategoryScreen';

export default function ViewClassGalleryImagesScreen({navigation}) {
  return (
    <ListScreen
      navigation={navigation}
      title="View Class Gallery Images"
      type="images"
    />
  );
}