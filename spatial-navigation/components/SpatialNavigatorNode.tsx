import React, { useRef, useState } from 'react'
import { View } from 'react-native'
import { useSpatialNavigator } from '../context/SpatialNavigatorContext'
import {
  SpatialNavigatorParentIdContext,
  useSpatialNavigatorParentId,
} from '../context/SpatialNavigatorParentIdContext'
import { useSpatialNavigatorParentScroll } from '../context/SpatialNavigatorParentScrollContext'
import { useBeforeMountEffect } from '../hooks/useBeforeMountEffect'
import { useUniqueId } from '../hooks/useUniqueId'

type FocusableProps = {
  isFocusable: true
  // If child is focusable, we force the child to be 1 single Element because, otherwise, we don't know where to bind the ref needed for scrolling.
  children: (props: { isFocused: boolean }) => React.ReactElement
}
type NonFocusableProps = {
  isFocusable?: false
  children: React.ReactNode
}
type Props = {
  onBlur?: () => void
  onFocus?: () => void
  onSelect?: () => void
  orientation?: 'horizontal' | 'vertical'
} & (FocusableProps | NonFocusableProps)

const useScrollIfNeeded = (): {
  scrollToNodeIfNeeded: () => void
  bindRefToChild: (child: React.ReactElement) => React.ReactElement
} => {
  const innerReactNodeRef = useRef<View | null>(null)
  const { scrollToNodeIfNeeded } = useSpatialNavigatorParentScroll()

  const bindRefToChild = (child: React.ReactElement) => {
    return React.cloneElement(child, {
      ...child.props,
      ref: (node: View) => {
        innerReactNodeRef.current = node // Keep your own reference
        // @ts-expect-error This works at runtime but we couldn't find how to type it properly.
        const { ref } = child // Call the original ref, if any
        if (typeof ref === 'function') {
          ref(node)
        }

        if (ref?.current !== undefined) {
          ref.current = node
        }
      },
    })
  }

  return { scrollToNodeIfNeeded: () => scrollToNodeIfNeeded(innerReactNodeRef), bindRefToChild }
}

export const SpatialNavigatorNode = ({
  onBlur,
  onFocus,
  onSelect,
  orientation = 'vertical',
  isFocusable = false,
  children,
}: Props) => {
  const spatialNavigator = useSpatialNavigator()
  const parentId = useSpatialNavigatorParentId()
  const [isFocused, setIsFocused] = useState(false)
  // If parent changes, we have to re-register the Node + all children -> adding the parentId to the nodeId makes the children re-register.
  const id = useUniqueId(`${parentId}_node_`)
  const { scrollToNodeIfNeeded, bindRefToChild } = useScrollIfNeeded()

  /** We don't re-register in LRUD on each render, because LRUD does not allow updating the nodes.
   * Therefore, the SpatialNavigator Node callbacks are registered at 1st render but can change (ie. if props change) afterward.
   * Since we want the functions to always be up to date, we use a reference to them. */
  const currentOnBlur = useRef<() => void>()
  currentOnBlur.current = onBlur

  const currentOnFocus = useRef<() => void>()
  currentOnFocus.current = onFocus

  const currentOnSelect = useRef<() => void>()
  currentOnSelect.current = onSelect

  useBeforeMountEffect(() => {
    spatialNavigator.registerNode(id, {
      parent: parentId,
      isFocusable,
      onBlur: () => {
        currentOnBlur.current?.()
        setIsFocused(false)
      },
      onFocus: () => {
        currentOnFocus.current?.()
        scrollToNodeIfNeeded()
        setIsFocused(true)
      },
      onSelect: () => currentOnSelect.current?.(),
      orientation,
    })

    return () => spatialNavigator.unregisterNode(id)
  }, [parentId])

  return (
    <SpatialNavigatorParentIdContext.Provider value={id}>
      {typeof children === 'function' ? bindRefToChild(children({ isFocused })) : children}
    </SpatialNavigatorParentIdContext.Provider>
  )
}
