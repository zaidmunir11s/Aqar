import { StyleSheet, View } from 'react-native';

import React, { FC, PropsWithChildren } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaView: FC<PropsWithChildren> = ({ children }) => {

  const { top, bottom } = useSafeAreaInsets();

  return (

    <View style={[styles.flex]}>

      <View style={[styles.backgroundColor, { height: top }]} />

      {children}

      <View style={[styles.backgroundColor, { height: bottom }]} />

    </View>

  );

};

export default SafeAreaView;

const styles = StyleSheet.create({

  flex: {

    flex: 1,

  },

  backgroundColor: {

    backgroundColor: 'white',

  },

});





