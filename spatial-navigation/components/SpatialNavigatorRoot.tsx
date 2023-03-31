import React, { ReactNode } from 'react'
import { SpatialNavigatorContext } from '../context/SpatialNavigatorContext'
import { SpatialNavigatorParentIdContext } from '../context/SpatialNavigatorParentIdContext'
import { useBeforeMountEffect } from '../hooks/useBeforeMountEffect'
import { useCreateSpatialNavigator } from '../hooks/useCreateSpatialNavigator'
import { useLockRootSpatialNavigator } from '../hooks/useLockRootSpatialNavigator'

const ROOT_SPATIAL_NAVIGATOR_ID = 'root'

export const SpatialNavigatorRoot = ({
  isLockedFromParent = false,
  children,
  onRightAndNoMove,
  onLeftAndNoMove,
}: {
  isLockedFromParent?: boolean
  children: ReactNode
  onRightAndNoMove?: () => void
  onLeftAndNoMove?: () => void
}) => {
  const spatialNavigator = useCreateSpatialNavigator({
    onLeftAndNoMove,
    onRightAndNoMove,
  })
  useBeforeMountEffect(() => {
    spatialNavigator.registerNode(ROOT_SPATIAL_NAVIGATOR_ID, { orientation: 'vertical' })
    return () => spatialNavigator.unregisterNode(ROOT_SPATIAL_NAVIGATOR_ID)
  }, [])
  useLockRootSpatialNavigator({
    spatialNavigator,
    isLocked: isLockedFromParent,
    lockReason: 'PARENT',
  })

  return (
    <SpatialNavigatorContext.Provider value={spatialNavigator}>
      <SpatialNavigatorParentIdContext.Provider value={ROOT_SPATIAL_NAVIGATOR_ID}>
        {children}
      </SpatialNavigatorParentIdContext.Provider>
    </SpatialNavigatorContext.Provider>
  )
}
