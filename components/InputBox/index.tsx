import React, { useState, useEffect } from "react";
import { TextInput, View, TouchableOpacity } from "react-native";
import styles from "./styles";
import { MaterialCommunityIcons, FontAwesome5, Entypo, Fontisto, MaterialIcons } from "@expo/vector-icons";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";

const InputBox = (props) => {

  const { chatRoomID } = props
  var flag = true
  const [message, setMessage] = useState('')
  const [myUserID, setMyUserID] = useState(null)

  useEffect(() => {
    const fetchUser = (async() => {
      const userInfo = await Auth.currentAuthenticatedUser()
      setMyUserID(userInfo.attributes.sub)
    })()
  },[])

  const onMicrophonePress = () => {
    console.warn('Microphone')
  }

  const updateChatRoomLastMessage = async(messageID: string) => {
    try{
      await API.graphql(graphqlOperation(updateChatRoom, {
        input: {
          id: chatRoomID,
          lastMessageID: messageID
        }
      }))
    }
    catch(e) { console.log(e) }
  }

  const onSendPress = async() => {
    //send to backend
    if(flag && message.trim() !== ""){
      flag = false
      try {
        const sentMessage = await API.graphql(graphqlOperation(createMessage, {
          input: {
            content: message.trim(),
            userID: myUserID,
            chatRoomID
          }
        }))
        updateChatRoomLastMessage(sentMessage.data.createMessage.id)
      }
      catch(e) { console.log(e) }
      setMessage('')
      flag = true
    }
  }

  const onPress = () => {
    if(!message) {
      onMicrophonePress()
    }
    else{
      onSendPress()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <FontAwesome5 name='laugh-beam' size={24} color={'grey'} />
        <TextInput placeholder="Say Something"
                   style={styles.textInput}
                   multiline
                   value = {message}
                   onChangeText = {setMessage}
                   />
        <Entypo name='attachment' size={24} color={'grey'} style={styles.icon}/>
        {!message && <Fontisto name='camera' size={24} color={'grey'} style={styles.icon}/>}
      </View>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.buttonContainer}>
          {
            !message
            ? <MaterialCommunityIcons name='microphone' size={28} color={'white'} />
            : <MaterialIcons name='send' size={28} color={'white'} />
          }
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default InputBox
