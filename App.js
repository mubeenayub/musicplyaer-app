import React from 'react';
import {
  StatusBar,
  View,
} from 'react-native';
import MusicPlayer from "./components/MusicPlayer";

const App = () => {
  return(
   <View>
    <StatusBar barStyle="light-content" />
     <MusicPlayer />
   </View>
  ) ;
};
export default App;
