import React from "react";
import { Text, View, Pressable } from "react-native";
import moment from "moment";
import styles from "./styles";
import { API, graphqlOperation } from "aws-amplify";
import { deleteMessage } from "../../src/graphql/mutations";

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

  const fun = async() => {
    await API.graphql(graphqlOperation(deleteMessage,{
      input: { id: message.id }
    }))
  }

  return (
    <Pressable onPress={fun} >
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
    </Pressable>
  )
}

export default ChatMessage
