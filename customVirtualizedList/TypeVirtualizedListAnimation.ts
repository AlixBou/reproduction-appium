import { ViewStyle, Animated } from 'react-native'

export type TypeVirtualizedListAnimation = (args: {
  currentlyFocusedItemIndex: number
  numberOfItemsVisibleOnHalfScreen: number
  itemSizeInPx: number
  vertical?: boolean
  isAnimated?: boolean
  offsetInPx: number
}) => Animated.WithAnimatedValue<ViewStyle>
