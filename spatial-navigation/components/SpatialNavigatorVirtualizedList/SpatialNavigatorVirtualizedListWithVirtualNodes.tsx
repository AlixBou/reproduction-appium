import uniqueId from 'lodash.uniqueid'
import React, { useCallback, useRef } from 'react'
import { useSpatialNavigator } from '../../context/SpatialNavigatorContext'
import {
  SpatialNavigatorParentIdContext,
  useSpatialNavigatorParentId,
} from '../../context/SpatialNavigatorParentIdContext'
import { updateVirtualNodeRegistration } from '../../helpers/updateVirtualNodeRegistration'
import { useBeforeMountEffect } from '../../hooks/useBeforeMountEffect'
import {
  CustomVirtualizedList,
  CustomVirtualizedListProps,
  ItemWithIndex,
} from '../../../customVirtualizedList/CustomVirtualizedList'
import { useCachedValues } from '../../../useCachedValues'
import { useMemo } from 'react'
import { typedMemo } from '../../../typedMemo'

const useCreateVirtualParentsIds = (parentId: string) =>
  useCachedValues(() => uniqueId(`${parentId}_virtual_`))

/**
 * Hook which will :
 * - register the initial virtualNodes
 * - unregister the final virtualNodes
 * Do it each time the parentId is changing
 */
const useRegisterInitialAndUnregisterFinalVitrualNodes = <T,>({
  allItems,
  parentId,
  registerNthVirtualNode,
  unregisterNthVirtualNode,
}: {
  allItems: Array<T>
  parentId: string
  registerNthVirtualNode: (index: number) => void
  unregisterNthVirtualNode: (index: number) => void
}) => {
  /** We don't unregister the nodes on each render because we want to update them instead (add new ones, move existing ones...).
   * We register each item in allItems at 1st render, and unregister all the registered nodes on unmount.
   * If data was added to allItems in the meantime (ex: onEndReached), the cleanup function needs to have "access" to this additional data in order to unregister the additional nodes.
   * This means the cleanup function needs to have access to up-to-date data, so we use a reference to the list of data. */
  const currentAllItems = useRef<Array<T>>(allItems)
  currentAllItems.current = allItems

  useBeforeMountEffect(() => {
    currentAllItems.current.forEach((_, n) => registerNthVirtualNode(n))

    return () => currentAllItems.current.forEach((_, n) => unregisterNthVirtualNode(n))
  }, [parentId])
}

const useUpdateRegistration = <T,>({
  allItems,
  registerNthVirtualNode,
}: {
  allItems: Array<T>
  registerNthVirtualNode: (index: number) => void
}) => {
  const previousAllItems = useRef<Array<T>>()

  // useBeforeMountEffect done every time allItems is changing to change the way the allItems is register in the spatialNavigator
  useBeforeMountEffect(() => {
    const previousAllItemsList = previousAllItems.current
    const isFirstRender = previousAllItemsList === undefined
    if (!isFirstRender) {
      updateVirtualNodeRegistration({
        currentItems: allItems,
        previousItems: previousAllItemsList,
        addVirtualNode: registerNthVirtualNode,
      })
    }
    previousAllItems.current = allItems
  }, [allItems])
}

const useRegisterVirtualNodes = <T extends ItemWithIndex>({ allItems }: { allItems: Array<T> }) => {
  const spatialNavigator = useSpatialNavigator()
  const parentId = useSpatialNavigatorParentId()
  const getNthVirtualNodeID = useCreateVirtualParentsIds(parentId)

  const registerNthVirtualNode = useCallback(
    (index: number) =>
      spatialNavigator.registerNode(getNthVirtualNodeID(index), {
        parent: parentId,
        orientation: 'vertical',
        isFocusable: false,
      }),
    [getNthVirtualNodeID, parentId, spatialNavigator],
  )

  const unregisterNthVirtualNode = useCallback(
    (index: number) => spatialNavigator.unregisterNode(getNthVirtualNodeID(index)),
    [getNthVirtualNodeID, spatialNavigator],
  )

  useRegisterInitialAndUnregisterFinalVitrualNodes({
    allItems,
    parentId,
    registerNthVirtualNode,
    unregisterNthVirtualNode,
  })

  useUpdateRegistration({ allItems, registerNthVirtualNode })

  return { getNthVirtualNodeID }
}

const ItemWrapperWithVirtualParentcontext = typedMemo(
  <T extends ItemWithIndex>({
    virtualParentID,
    item,
    renderItem,
  }: {
    virtualParentID: string
    item: T
    renderItem: CustomVirtualizedListProps<T>['renderItem']
  }) => (
    <SpatialNavigatorParentIdContext.Provider value={virtualParentID}>
      {renderItem({ item })}
    </SpatialNavigatorParentIdContext.Provider>
  ),
)

export const SpatialNavigatorVirtualizedListWithVirtualNodes = typedMemo(
  <T extends ItemWithIndex>(props: CustomVirtualizedListProps<T>) => {
    const { getNthVirtualNodeID } = useRegisterVirtualNodes({ allItems: props.data })

    const { renderItem } = props
    const renderWrappedItem: typeof props.renderItem = useCallback(
      ({ item }) => (
        <ItemWrapperWithVirtualParentcontext
          virtualParentID={getNthVirtualNodeID(item.index)}
          renderItem={renderItem}
          item={item}
        />
      ),
      [getNthVirtualNodeID, renderItem],
    )

    return <CustomVirtualizedList {...props} renderItem={renderWrappedItem} />
  },
)
