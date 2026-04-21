import React, {useEffect} from 'react';
import {Image, ImageBackground, StyleSheet, View, useWindowDimensions} from 'react-native';

export default function SplashScreen({onFinish}) {
  const {width: windowWidth} = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoSize = Math.min(210, Math.max(140, windowWidth * 0.52));

  return (
    <ImageBackground
      source={require('../../assets/images/SplashBackground.jpg')}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}>
      <View style={styles.overlay}>
        <Image
          source={require('../../assets/images/SplashLogo.png')}
          style={[styles.logo, {width: logoSize, height: logoSize}]}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  backgroundImage: {
    opacity: 0.12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 210,
    height: 210,
  },
});
