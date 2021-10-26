import React, { useEffect, useState } from "react";
import { Text, View, Pressable, Image, ActivityIndicator } from "react-native";
import moment from "moment";
import styles from "./styles";
import { API, graphqlOperation } from "aws-amplify";
import { deleteMessage } from "../../src/graphql/mutations";
import { useNavigation } from "@react-navigation/native";
import { Storage } from "aws-amplify";

export type ChatMessageProps = {
  message: Message
  id: String
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message, id, bottomSheetRef } = props
  const [uri, setUri] = useState('toBeFetched')
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState('')
  const navigation = useNavigation()

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

  const openImage = async(message) => {
    if(!message.isImage){
      await API.graphql(graphqlOperation(deleteMessage,{
         input: {
           id: message.id
         }
      }))
    }
    else if(!loading){
      bottomSheetRef?.current?.close()
      navigation.navigate('ImageFullScreen', {img: uri, key, name: isMyMessage() ? 'You' : message.user.name, timestamp: timestamp()})
    }
  }

  useEffect(() => {
    if(message.isImage){
      if(message.content.startsWith('file')){
        setUri(message.content.split(' ')[0])
        setKey(message.content.split(' ')[1])
      }
      else {
        const fetchImage = (async() => {
          setUri(await Storage.get(message.content))
        })()
      }
    }
  },[])

  const displayImage = () => {
    setLoading(false)
  }

  return (
    <Pressable onPress={() => openImage(message)} >
      <View style = {styles.container}>
        <View style = {
          [styles.messageBox,{
            backgroundColor: isMyMessage() ? '#e3bbf0' : 'white',
            marginRight: isMyMessage() ? 5 : 50,
            marginLeft: isMyMessage() ? 50 : 5,
            alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
            padding: message.isImage ? 5 : 10
          }]}>
          {false && <Text style={styles.name}>{message.user.name}</Text>}
          {message.isImage ?
            <View>
              {loading && <ActivityIndicator style={styles.activityIndicator} color={'#75228f'} size={'large'}/>}
              <Image source={{uri: uri}} onLoadEnd={displayImage} style={styles.image} resizeMode='cover'/>
            </View>
          :
            <Text style = {styles.message}>{message.content}</Text>}
          <Text style = {styles.time}>{timestamp()}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default ChatMessage
