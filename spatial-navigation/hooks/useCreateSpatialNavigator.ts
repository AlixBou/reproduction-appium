import { useEffect, useMemo } from "react";
import EntitySpatialNavigator from "../EntitySpatialNavigator";

export const useCreateSpatialNavigator = ({
  onLeftAndNoMove,
  onRightAndNoMove,
}: {
  onLeftAndNoMove?: () => void;
  onRightAndNoMove?: () => void;
}) => {
  const spatialNavigator = useMemo(
    () =>
      new EntitySpatialNavigator({
        onLeftAndNoMove,
        onRightAndNoMove,
      }),
    [onLeftAndNoMove, onRightAndNoMove]
  );

  useEffect(() => {
    spatialNavigator.subscribe();
    return () => spatialNavigator.unsubscribe();
  }, [spatialNavigator]);

  return spatialNavigator;
};
