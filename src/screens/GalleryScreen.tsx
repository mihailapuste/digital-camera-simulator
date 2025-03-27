import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@stores/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@navigation/types';
import FastImage from 'react-native-fast-image';
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type GalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Gallery'
>;

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const {cameraStore} = useStores();
  const [loading, setLoading] = useState(true);
  const {width} = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  // Calculate the width of each image in the grid (3 columns with small gaps)
  const imageSize = (width - 8) / 3;

  // Function to load photos
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      await cameraStore.loadPhotos();
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  }, [cameraStore]);

  // Load photos when component mounts
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  // Refresh photos when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  // Create dynamic styles based on insets
  const headerStyle = useCallback(() => {
    return {
      paddingTop: insets.top > 0 ? insets.top : 12,
    };
  }, [insets.top]);

  // Create a dedicated style for FlashList contentContainerStyle
  const flashListContentStyle = {
    padding: 2,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
  };

  const renderItem = ({item, index}: {item: string; index: number}) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => {
        // Navigate to the ImageViewer with the selected image index
        navigation.navigate('ImageViewer', {initialIndex: index});
      }}>
      <FastImage
        source={{uri: `file://${item}`}}
        style={[styles.image, {width: imageSize, height: imageSize}]}
        resizeMode={FastImage.resizeMode.cover}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, headerStyle()]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : cameraStore.images.length > 0 ? (
        <View style={styles.flashListContainer}>
          <FlashList
            data={cameraStore.images}
            renderItem={renderItem}
            keyExtractor={item => item}
            numColumns={3}
            estimatedItemSize={imageSize}
            contentContainerStyle={flashListContentStyle}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos yet</Text>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.cameraButtonText}>Take Photos</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    fontSize: 16,
    color: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  gridContainer: {
    backgroundColor: '#000',
  },
  imageContainer: {
    margin: 1,
  },
  image: {
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  flashListContainer: {
    flex: 1,
    width: '100%',
  },
});

export default observer(GalleryScreen);
