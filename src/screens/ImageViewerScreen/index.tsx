import React, {useState, useRef, useEffect} from 'react';
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
import {FlashList} from '@shopify/flash-list';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
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

  const insets = useSafeAreaInsets();

  const initialIndex = route.params.initialIndex;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (flatListRef.current && initialIndex > 0) {
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }
  }, [initialIndex, flatListRef]);

  const handleViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = ({item}: {item: string}) => (
    <ImageView uri={`file://${item}`} />
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={styles.container}>
        <View style={[styles.header]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.counter}>
            {currentIndex + 1} / {cameraStore.images.length}
          </Text>
        </View>

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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#4cd964',
    fontSize: 16,
    fontWeight: '500',
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
