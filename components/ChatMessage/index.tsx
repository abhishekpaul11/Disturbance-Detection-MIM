import React from "react";
import { Text, View } from "react-native";
import moment from "moment";
import styles from "./styles";

export type ChatMessageProps = {
  message: Message
  id: String
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message, id } = props

  const isMyMessage = () => {
    return message.user.id === id
  }

  const timestamp = () => {
    const diff = moment().diff(message.createdAt, 'days')
    if(diff > 1) return moment(message.createdAt).format('Do MMM \'YY h:mm a');
    const ts = moment(message.createdAt).fromNow()
    if(['in a few seconds', 'a few seconds ago'].includes(ts)) return 'just now'
    return ts
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
        <Text style = {styles.time}>{timestamp()}</Text>
      </View>
    </View>
  )
}

export default ChatMessage
