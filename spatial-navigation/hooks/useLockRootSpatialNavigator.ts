import { useEffect } from "react";
import EntitySpatialNavigator from "../EntitySpatialNavigator";
import { LockReason } from "../types/SpatialNavigatorLockReasons";

export const useLockRootSpatialNavigator = ({
  spatialNavigator,
  isLocked,
  lockReason,
}: {
  spatialNavigator: EntitySpatialNavigator;
  isLocked: boolean;
  lockReason: LockReason;
}) => {
  useEffect(() => {
    if (isLocked) spatialNavigator.lock(lockReason);
    else spatialNavigator.unlock(lockReason);
  }, [spatialNavigator, isLocked, lockReason]);
};
