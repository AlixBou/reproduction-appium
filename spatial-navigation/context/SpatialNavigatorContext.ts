import { createContext, useContext } from "react";
import EntitySpatialNavigator from "./../EntitySpatialNavigator";

export const SpatialNavigatorContext =
  createContext<EntitySpatialNavigator | null>(null);

export const useSpatialNavigator = () => {
  const spatialNavigator = useContext(SpatialNavigatorContext);
  if (!spatialNavigator)
    throw new Error(
      "[EntitySpatialNavigator] No registered spatial navigator on this page. Please use the <Page /> component."
    );
  return spatialNavigator;
};
