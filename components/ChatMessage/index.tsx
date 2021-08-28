import React from "react";
import { Text, View } from "react-native";
import moment from "moment";
import styles from "./styles";

export type ChatMessageProps = {
  message: Message
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message } = props

  const isMyMessage = () => {
    return message.user.id === 'u1'
  }

  return (
    <View style = {styles.container}>
      <View style = {
        [styles.messageBox,{
          backgroundColor: isMyMessage() ? '#e3bbf0' : 'white',
          marginRight: isMyMessage() ? 5 : 50,
          marginLeft: isMyMessage() ? 50 : 5,
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start'
        }]}>
        {false && <Text style={styles.name}>{message.user.name}</Text>}
        <Text style = {styles.message}>{message.content}</Text>
        <Text style = {styles.time}>{moment(message.createdAt).fromNow()}</Text>
      </View>
    </View>
  )
}

export default ChatMessage
