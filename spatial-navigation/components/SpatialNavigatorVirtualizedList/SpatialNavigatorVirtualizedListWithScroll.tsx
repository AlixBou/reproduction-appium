import React, { useCallback,  useState } from 'react'
import { SpatialNavigatorNode } from '../SpatialNavigatorNode'
import { SpatialNavigatorVirtualizedListWithVirtualNodes } from './SpatialNavigatorVirtualizedListWithVirtualNodes'
import {
  ScrollToNodeCallback,
  SpatialNavigatorParentScrollContext,
  useSpatialNavigatorParentScroll,
} from '../../context/SpatialNavigatorParentScrollContext'
import {
  CustomVirtualizedListProps,
  ItemWithIndex,
} from '../../../customVirtualizedList/CustomVirtualizedList'
import { typedMemo } from '../../../typedMemo'

const ItemWrapperWithScrollcontext = typedMemo(
  <T extends ItemWithIndex>({
    setCurrentlyFocusedItemIndex,
    item,
    renderItem,
  }: {
    setCurrentlyFocusedItemIndex: (i: number) => void
    item: T
    renderItem: CustomVirtualizedListProps<T>['renderItem']
  }) => {
    const { scrollToNodeIfNeeded: makeParentsScrollToNodeIfNeeded } =
      useSpatialNavigatorParentScroll()
    const scrollToItem: ScrollToNodeCallback = useCallback(
      (newlyFocusedElementRef) => {
        setCurrentlyFocusedItemIndex(item.index)
        makeParentsScrollToNodeIfNeeded(newlyFocusedElementRef) // We need to propagate the scroll event for parents if we have nested ScrollViews/VirtualizedLists.
      },
      [makeParentsScrollToNodeIfNeeded, setCurrentlyFocusedItemIndex, item.index],
    )

    return (
      <SpatialNavigatorParentScrollContext.Provider value={scrollToItem}>
        {renderItem({ item })}
      </SpatialNavigatorParentScrollContext.Provider>
    )
  },
)

export type SpatialNavigatorVirtualizedListWithScrollProps<T extends ItemWithIndex> = Omit<
  CustomVirtualizedListProps<T>,
  'currentlyFocusedItemIndex'
>

export const SpatialNavigatorVirtualizedListWithScroll = typedMemo(
  <T extends ItemWithIndex>(props: SpatialNavigatorVirtualizedListWithScrollProps<T>) => {
    const [currentlyFocusedItemIndex, setCurrentlyFocusedItemIndex] = useState(0)

    const { renderItem } = props
    const renderWrappedItem: typeof props.renderItem = useCallback(
      ({ item }) => (
        <ItemWrapperWithScrollcontext
          setCurrentlyFocusedItemIndex={setCurrentlyFocusedItemIndex}
          renderItem={renderItem}
          item={item}
        />
      ),
      [setCurrentlyFocusedItemIndex, renderItem],
    )

    return (
      <SpatialNavigatorNode orientation="horizontal">
        <SpatialNavigatorVirtualizedListWithVirtualNodes
          {...props}
          currentlyFocusedItemIndex={currentlyFocusedItemIndex}
          renderItem={renderWrappedItem}
        />
      </SpatialNavigatorNode>
    )
  },
)
