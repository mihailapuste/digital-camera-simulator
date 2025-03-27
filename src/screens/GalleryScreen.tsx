import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
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

type GalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Gallery'
>;

const GalleryScreen = observer(() => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const {cameraStore} = useStores();
  const {width} = Dimensions.get('window');
  const [loading, setLoading] = useState(true);

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
    }, [loadPhotos])
  );

  const renderItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => {
        // Navigate to a detail view if needed
        // navigation.navigate('ImageDetail', {imagePath: item});
      }}>
      <Image
        source={{uri: `file://${item}`}}
        style={[styles.image, {width: imageSize, height: imageSize}]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
        <FlatList
          data={cameraStore.images}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
        />
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
});

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
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  gridContainer: {
    padding: 2,
  },
  imageContainer: {
    margin: 1,
  },
  image: {
    borderRadius: 2,
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
});

export default GalleryScreen;
