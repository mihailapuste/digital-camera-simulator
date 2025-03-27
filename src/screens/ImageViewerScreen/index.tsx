import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GestureHandlerRootView, State} from 'react-native-gesture-handler';
import ImageView from './components/ImageView';

const {width} = Dimensions.get('window');

type ImageViewerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ImageViewer'
>;

type ImageViewerScreenRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

const ImageViewerScreen: React.FC = () => {
  const navigation = useNavigation<ImageViewerScreenNavigationProp>();
  const route = useRoute<ImageViewerScreenRouteProp>();
  const {cameraStore} = useStores();
  const flatListRef = useRef<FlashList<string>>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const insets = useSafeAreaInsets();

  // Get the initial index from the route params
  const initialIndex = route.params.initialIndex;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Scroll to the initial index when the component mounts
  React.useEffect(() => {
    if (flatListRef.current && initialIndex > 0) {
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }
  }, [initialIndex]);

  // Handle scroll end to update the current index
  const handleViewableItemsChanged = React.useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Handle deleting the current image
  const handleDeleteImage = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const imageToDelete = cameraStore.images[currentIndex];

            // If there's only one image left, go back to gallery after deletion
            if (cameraStore.images.length <= 1) {
              cameraStore.removeImage(imageToDelete);
              navigation.goBack();
              return;
            }

            // If deleting the last image, move to the previous one
            const newIndex =
              currentIndex === cameraStore.images.length - 1
                ? currentIndex - 1
                : currentIndex;

            cameraStore.removeImage(imageToDelete);

            // Update current index if needed
            if (currentIndex !== newIndex) {
              setCurrentIndex(newIndex);

              // Scroll to the new index
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                  index: newIndex,
                  animated: true,
                });
              }
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Render each image in full screen
  const renderItem = ({item}: {item: string}) => (
    <ImageView uri={`file://${item}`} />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={styles.container}>
        {/* Header with back button and counter */}

        <View style={[styles.header]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.counter}>
            {currentIndex + 1} / {cameraStore.images.length}
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteImage}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Full screen image gallery with horizontal swiping */}
        <FlashList
          ref={flatListRef}
          data={cameraStore.images}
          renderItem={renderItem}
          keyExtractor={item => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          estimatedItemSize={width}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  counter: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default observer(ImageViewerScreen);
