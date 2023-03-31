import React from 'react'
import { SpatialNavigatorVirtualizedList } from '../spatial-navigation/components/SpatialNavigatorVirtualizedList/SpatialNavigatorVirtualizedList'
import { SpatialNavigatorVirtualizedListWithScrollProps } from '../spatial-navigation/components/SpatialNavigatorVirtualizedList/SpatialNavigatorVirtualizedListWithScroll'
import { ItemWithIndex } from '../customVirtualizedList/CustomVirtualizedList'

export type RowProps<T extends ItemWithIndex> = { } & Omit<
  SpatialNavigatorVirtualizedListWithScrollProps<T>,
  'isAnimated'
>

export const Row = <T extends ItemWithIndex>(props: RowProps<T>) => {
  return (
    <>
      <SpatialNavigatorVirtualizedList {...props} isAnimated />
    </>
  )
}


