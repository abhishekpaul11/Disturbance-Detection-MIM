import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';

export default function ImportantMessagesScreen() {
  return (
    <View style={[styles.container, {paddingHorizontal: 10}]}>
      <Text style={styles.text}>{'Work Mode is OFF\nTurn it ON to view Messages marked as \'Important\''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: 'grey',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: '55%'
  }
});
