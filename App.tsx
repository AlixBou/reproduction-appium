import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Row } from './row/Row';
import { SpatialNavigatorNode } from './spatial-navigation/components/SpatialNavigatorNode';
import { SpatialNavigatorRoot } from './spatial-navigation/components/SpatialNavigatorRoot';
import { LogBox } from 'react-native';
import EntityKeyboard from './spatial-navigation/EntityKeyboard';
LogBox.ignoreLogs([
  "Overwriting fontFamily style attribute preprocessor"
]);

const data = [{index : 1},{index : 2},{index : 3},{index : 4},{index : 5},{index : 6},{index : 7},{index : 8},
  {index : 9},{index : 10},{index : 11},{index : 12},{index : 13},{index : 14},{index : 15},{index : 16},{index : 17},{index : 18},
  {index : 19},{index : 20},{index : 21},{index : 22},{index : 23},{index : 24}]

const renderItem = (item : {index: number}) => {
  return (<SpatialNavigatorNode isFocusable>
      {({ isFocused }) => (
        <View testID={`item${item.index}`} style={{backgroundColor : isFocused ?'green' : 'red', height : 30, width : 140}}/>
     )}
    </SpatialNavigatorNode>
    )
}
export default function App() {

  useEffect(() => {
    EntityKeyboard.instance.addEventListener()
    return () => EntityKeyboard.instance.removeEventListener()
  }, [])
  
  return (

    <View style={{height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,}}>
    <SpatialNavigatorRoot
      isLockedFromParent={false}
    >
      <Row renderItem={(item) => renderItem(item.item)} data ={data} itemSize={160} numberOfRenderedItems={12} numberOfItemsVisibleOnScreen={6}></Row>
    </SpatialNavigatorRoot>
  </View>
)
}



