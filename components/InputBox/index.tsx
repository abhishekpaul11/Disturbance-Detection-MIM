import React, { useState, useEffect } from "react";
import { TextInput, View, TouchableOpacity } from "react-native";
import styles from "./styles";
import moment from "moment";
import { MaterialCommunityIcons, FontAwesome5, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";

const InputBox = (props) => {

  const { chatRoomID, addMessage, sendImage } = props
  const [message, setMessage] = useState('')
  const [myUserID, setMyUserID] = useState(null)
  const [myName, setMyName] = useState(null)

  useEffect(() => {
    const fetchUser = (async() => {
      const userInfo = await Auth.currentAuthenticatedUser()
      setMyUserID(userInfo.attributes.sub)
      setMyName(userInfo.signInUserSession.accessToken.payload.username)
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
    if(message.trim() !== ""){
      addMessage({
        user: {
          name: myName.charAt(0).toUpperCase() + myName.slice(1),
          id: myUserID
        },
        content: message.trim(),
        createdAt: moment().toISOString(),
        isImage: false
      })
      setMessage('')
      try {
        const sentMessage = await API.graphql(graphqlOperation(createMessage, {
          input: {
            content: message.trim(),
            userID: myUserID,
            chatRoomID,
            isImage: false
          }
        }))
        updateChatRoomLastMessage(sentMessage.data.createMessage.id)
      }
      catch(e) { console.log(e) }
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
        {!message &&
          <TouchableOpacity onPress = {sendImage}>
            <Ionicons name='image-outline' size={26} color={'grey'} style={styles.icon}/>
          </TouchableOpacity>
        }
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
