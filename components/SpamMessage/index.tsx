import React from "react";
import { View, Text } from "react-native";
import styles from "./styles";

const SpamMessage = ({ isMyMessage, timestamp, name }) => {
  return (
    <View style = {styles.container}>
      <View style = {
        [styles.messageBox,{
          backgroundColor: isMyMessage() ? '#e3bbf0' : 'white',
          marginRight: isMyMessage() ? 5 : 50,
          marginLeft: isMyMessage() ? 50 : 5,
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
        }]}>
        {false && !isMyMessage() && <Text style={styles.name}>{name}</Text>}
        <Text style={styles.message}>{'Message flagged as Distracting'}</Text>
        <Text style = {styles.time}>{timestamp()}</Text>
      </View>
    </View>
  )
}

export default SpamMessage
