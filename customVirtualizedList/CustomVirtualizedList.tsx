import React, { memo, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Animated, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native'
import { typedMemo } from '../typedMemo'
import { getRange } from './HelperGetRange'
import { useCustomVirtualizedListAnimation } from './useCustomVirtualizedListAnimation'
import { Dimensions } from 'react-native'

export const screen = Dimensions.get('window')
/**
 * @TODO: CustomVirtualizedList should be able to take any data as params.
 * We shouldn't restrict the use to a data that is indexed -> a mistake can be made on usage
 * if the data is not indexed properly for example.
 * The indexing should be done inside CustomVirtualizedList directly & CustomVirtualizedListProps
 * should accept any generic type T.
 */
export type ItemWithIndex = { index: number }

export interface CustomVirtualizedListProps<T extends ItemWithIndex> {
  data: Array<T>
  renderItem: (args: { item: T }) => JSX.Element
  /** If vertical the height of an item, otherwise the width */
  itemSize: number
  currentlyFocusedItemIndex: number
  /** How many items are RENDERED (virtualization size) */
  numberOfRenderedItems: number
  /** How many items are visible on screen (helps with knowing how to center the current item) */
  numberOfItemsVisibleOnScreen: number
  onEndReached?: () => void
  /** Number of items left to display before triggering onEndReached */
  onEndReachedThresholdItemsNumber?: number
  isAnimated?: boolean
  style?: ViewStyle
  vertical?: boolean
  ListHeaderComponent?: ReactNode
}

const useOnEndReached = ({
  numberOfItems,
  range,
  currentlyFocusedItemIndex,
  onEndReachedThresholdItemsNumber,
  onEndReached,
}: {
  numberOfItems: number
  range: { start: number; end: number }
  currentlyFocusedItemIndex: number
  onEndReachedThresholdItemsNumber: number
  onEndReached: (() => void) | undefined
}) => {
  useEffect(() => {
    if (numberOfItems === 0 || range.end === 0) {
      return
    }

    if (currentlyFocusedItemIndex === numberOfItems - 1 - onEndReachedThresholdItemsNumber) {
      onEndReached?.()
    }
  }, [
    onEndReached,
    range.end,
    currentlyFocusedItemIndex,
    onEndReachedThresholdItemsNumber,
    numberOfItems,
  ])
}

const ItemContainerWithAnimatedStyle = typedMemo(
  <T extends ItemWithIndex>({
    item,
    renderItem,
    itemSize,
    vertical,
  }: {
    item: T
    renderItem: CustomVirtualizedListProps<T>['renderItem']
    itemSize: number
    vertical: boolean
  }) => {
    const style = useMemo(
      () =>
        StyleSheet.flatten([
          styles.item,
          vertical
            ? { transform: [{ translateY: item.index * itemSize }] }
            : { transform: [{ translateX: item.index * itemSize }] },
        ]),
      [item.index, itemSize, vertical],
    )
    return <View                
        accessible={false}
        style={style}>{renderItem({ item })}</View>
  },
)

const HeaderComponent = memo(
  ({
    ListHeaderComponent,
    onHeaderComponentLayout,
  }: {
    ListHeaderComponent: ReactNode
    onHeaderComponentLayout: (event: LayoutChangeEvent) => void
  }) => <View onLayout={onHeaderComponentLayout}>{ListHeaderComponent}</View>,
)

const useHeaderComponent = (
  vertical: boolean,
  ListHeaderComponent?: ReactNode,
): { ScrollableHeaderComponent: ReactNode | null; headerSizeInPx: number } => {
  const [headerSizeInPx, setHeaderSizeInPx] = useState(0)
  const onHeaderComponentLayout = useCallback(
    (event: LayoutChangeEvent) =>
      setHeaderSizeInPx(
        vertical ? event.nativeEvent.layout.height : event.nativeEvent.layout.width,
      ),
    [vertical],
  )

  const ScrollableHeaderComponent = useMemo(
    () =>
      ListHeaderComponent ? (
        <HeaderComponent
          ListHeaderComponent={ListHeaderComponent}
          onHeaderComponentLayout={onHeaderComponentLayout}
        />
      ) : null,
    [ListHeaderComponent, onHeaderComponentLayout],
  )

  return { headerSizeInPx, ScrollableHeaderComponent }
}
/**
 * Why this has been made:
 *   - it gives us full control on the way we scroll (using CSS animations)
 *   - it is way more performant than a FlatList
 */
export const CustomVirtualizedList = typedMemo(
  <T extends ItemWithIndex>({
    data,
    renderItem,
    itemSize,
    currentlyFocusedItemIndex,
    numberOfRenderedItems,
    numberOfItemsVisibleOnScreen = 8,
    onEndReached,
    onEndReachedThresholdItemsNumber = 3,
    isAnimated = false,
    style,
    vertical = false,
    ListHeaderComponent,
  }: CustomVirtualizedListProps<T>) => {
    const numberOfItemsVisibleOnHalfScreen = Math.floor(numberOfItemsVisibleOnScreen / 2)
    const range = getRange(data, currentlyFocusedItemIndex, numberOfRenderedItems)

    const dataSliceToRender = data.slice(range.start, range.end + 1)

    const { ScrollableHeaderComponent, headerSizeInPx } = useHeaderComponent(
      vertical,
      ListHeaderComponent,
    )

    useOnEndReached({
      numberOfItems: data.length,
      range,
      currentlyFocusedItemIndex,
      onEndReachedThresholdItemsNumber,
      onEndReached,
    })

    const animatedStyle = useCustomVirtualizedListAnimation({
      currentlyFocusedItemIndex,
      numberOfItemsVisibleOnHalfScreen,
      itemSizeInPx: itemSize,
      isAnimated,
      vertical,
      offsetInPx: headerSizeInPx,
    })

    /* This weird key with a modulo is actually a "recycled" list implementation
     *
     * If I scroll to the right and the first item needs to be unmounted, then recycling
     * will actually take this item, move it to the end, and update its props. */
    const recycledKeyExtractor = useCallback(
      (index: number) => `recycled_item_${index % numberOfRenderedItems}`,
      [numberOfRenderedItems],
    )

    return (
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          style,
          { flexDirection: vertical ? 'column' : 'row' },
        ]}
        accessible={false}
      >
        {ScrollableHeaderComponent}
        <View>
          {dataSliceToRender.map((item) => {
            return (
              <ItemContainerWithAnimatedStyle<T>
                key={recycledKeyExtractor(item.index)}
                renderItem={renderItem}
                item={item}
                itemSize={itemSize}
                vertical={vertical}
              />
            )
          })}
        </View>
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // This property is mandatory in order to get testID visible on Appium Inspector for portrait lockup -- We don't have a long term strategy for this behavior
    width: screen.width,
  },
  item: {
    left: 0,
    position: 'absolute',
  },
})
