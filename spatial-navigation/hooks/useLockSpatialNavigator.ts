import { useSpatialNavigator } from "../context/SpatialNavigatorContext";
import { useLockRootSpatialNavigator } from "../hooks/useLockRootSpatialNavigator";
import { LockReason } from "../types/SpatialNavigatorLockReasons";

export const useLockSpatialNavigator = ({
  isLocked,
  lockReason,
}: {
  isLocked: boolean;
  lockReason: LockReason;
}) => {
  const spatialNavigator = useSpatialNavigator();

  useLockRootSpatialNavigator({ spatialNavigator, isLocked, lockReason });
};
