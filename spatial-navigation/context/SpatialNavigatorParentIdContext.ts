import { createContext, useContext } from "react";

export const SpatialNavigatorParentIdContext = createContext<string | null>(
  null
);

export const useSpatialNavigatorParentId = () => {
  const spatialNavigatorParentId = useContext(SpatialNavigatorParentIdContext);
  if (!spatialNavigatorParentId)
    throw new Error(
      "[EntitySpatialNavigator] Element used without ParentId in context!"
    );
  return spatialNavigatorParentId;
};
