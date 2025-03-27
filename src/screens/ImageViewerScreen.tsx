import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@navigation/types';
import {useStores} from '@stores/index';
import {
  GestureHandlerRootView,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import {FlashList} from '@shopify/flash-list';

type ImageViewerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ImageViewer'
>;

type ImageViewerScreenRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

const {width, height} = Dimensions.get('window');

const ImageViewerScreen = observer(() => {
  const navigation = useNavigation<ImageViewerScreenNavigationProp>();
  const route = useRoute<ImageViewerScreenRouteProp>();
  const {cameraStore} = useStores();
  const flatListRef = useRef<FlashList<string>>(null);
  const doubleTapRef = useRef(null);
  const [headerVisible, setHeaderVisible] = useState(true);

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

  // Single tap handler to toggle header visibility
  const onSingleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setHeaderVisible(!headerVisible);
    }
  };

  // Render each image in full screen
  const renderItem = ({item}: {item: string}) => (
    <View style={styles.imageContainer}>
      <TapGestureHandler onHandlerStateChange={onSingleTap}>
        <View style={styles.imageWrapper}>
          <FastImage
            source={{uri: `file://${item}`}}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </TapGestureHandler>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />

        {/* Header with back button and counter */}
        {headerVisible && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.counter}>
              {currentIndex + 1} / {cameraStore.images.length}
            </Text>

            <View style={styles.placeholder} />
          </View>
        )}

        {/* Full screen image gallery with horizontal swiping */}
        <FlashList
          ref={flatListRef}
          data={cameraStore.images}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          estimatedItemSize={width}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    fontWeight: '500',
  },
  placeholder: {
    width: 50,
  },
  imageContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: width,
    height: height - 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewerScreen;
