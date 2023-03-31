import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { TypeVirtualizedListAnimation } from "./TypeVirtualizedListAnimation";

export const useCustomVirtualizedListAnimation: TypeVirtualizedListAnimation =
  ({
    currentlyFocusedItemIndex,
    numberOfItemsVisibleOnHalfScreen,
    itemSizeInPx,
    vertical = false,
    offsetInPx,
  }) => {
    const translation = useRef<Animated.Value>(new Animated.Value(0)).current;

    useEffect(() => {
      const isRowBeginning =
        currentlyFocusedItemIndex < numberOfItemsVisibleOnHalfScreen;
      /**
       *  @todo implementing a viewPosition scroll that is a proportion of the screen would be done here
       */
      const scrollOffset =
        (currentlyFocusedItemIndex - numberOfItemsVisibleOnHalfScreen) *
          itemSizeInPx +
        offsetInPx;

      const newTranslationValue = isRowBeginning ? 0 : -scrollOffset;

      Animated.timing(translation, {
        toValue: newTranslationValue,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.sin),
      }).start();
    }, [
      currentlyFocusedItemIndex,
      numberOfItemsVisibleOnHalfScreen,
      itemSizeInPx,
      translation,
      offsetInPx,
    ]);

    return {
      transform: [
        vertical ? { translateY: translation } : { translateX: translation },
      ],
    };
  };
