import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Canvas, Image, ColorMatrix, useImage} from '@shopify/react-native-skia';

const {width, height} = Dimensions.get('window');

interface ImageViewProps {
  uri: string;
}

// Black and white image component using Skia
const BlackAndWhiteImage = ({uri}: {uri: string}) => {
  const image = useImage(uri);

  if (!image) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return (
    <Canvas style={styles.image}>
      <Image
        image={image}
        fit="contain"
        x={0}
        y={0}
        width={width}
        height={height * 0.8}>
        <ColorMatrix
          matrix={[
            // Black and white matrix
            0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0,
            0, 0, 0, 0, 1, 0,
          ]}
        />
      </Image>
    </Canvas>
  );
};

const ImageView: React.FC<ImageViewProps> = ({uri}) => {
  return (
    <View style={styles.imageContainer}>
      <BlackAndWhiteImage uri={uri} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  image: {
    flex: 1,
    width,
    height: height * 0.8,
  },
  imagePlaceholder: {
    backgroundColor: '#333',
  },
});

export default ImageView;
