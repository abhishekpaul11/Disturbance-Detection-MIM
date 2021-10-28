import React, { useState, useEffect, useRef } from "react";
import { TextInput, View, TouchableOpacity, Keyboard } from "react-native";
import styles from "./styles";
import moment from "moment";
import { MaterialCommunityIcons, FontAwesome5, Entypo, Ionicons, MaterialIcons, Octicons, AntDesign } from "@expo/vector-icons";
import EmojiSelector, { Categories} from 'react-native-emoji-selector'

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";

const InputBox = (props) => {

  const { chatRoomID, addMessage, sendImage, getEmoji, showEmo } = props
  const [message, setMessage] = useState('')
  const [myUserID, setMyUserID] = useState(null)
  const [myName, setMyName] = useState(null)
  const [emoji, showEmoji] = useState(false)
  const [emojiHeight, setEmojiHeight] = useState(318)
  const [emojiSearch, setEmojiSearch] = useState(false)
  const keyboard = useRef(null)
  const keyboardHeight = useRef(0)

  getEmoji(emoji)

  useEffect(() => {
    showEmoji(false)
  },[showEmo])

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

  const pickEmoji = () => {
    Keyboard.dismiss()
    showEmoji(!emoji)
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        if(emojiSearch){
          setEmojiHeight(120)
        }
        else{
          showEmoji(false);
          keyboardHeight.current = e.endCoordinates.height
          setEmojiHeight(keyboardHeight.current)
        }
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setEmojiHeight(keyboardHeight.current)
      }
    )
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    };
  }, [emojiSearch]);

  useEffect(() => {
    if(!emoji){
      setEmojiSearch(false)
    }
  },[emoji])

  const endSearch = () => {
    showEmoji(false)
    keyboard.current.focus()
  }

  const addImage = () => {
    sendImage()
    showEmoji(false)
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          {emoji
          ? emojiSearch
            ? <TouchableOpacity onPress={endSearch}>
                <AntDesign name="arrowleft" size={24} color="grey" />
              </TouchableOpacity>
            : <TouchableOpacity onPress={() => keyboard.current.focus()}>
                <Entypo name="keyboard" size={24} color="grey" />
              </TouchableOpacity>
          : <TouchableOpacity onPress={pickEmoji}>
              <FontAwesome5 name='laugh-beam' size={24} color={'grey'} />
            </TouchableOpacity>
          }
          <TextInput ref = {keyboard}
                     placeholder="Say Something"
                     selectionColor = {'#75228f'}
                     style={styles.textInput}
                     multiline
                     value = {message}
                     onChangeText = {setMessage}
                     />
          {emoji && !emojiSearch &&
            <TouchableOpacity onPress={() => setEmojiSearch(true)}>
              <Octicons name='search' size={22} color={'grey'} style={styles.icon}/>
            </TouchableOpacity> }
          {!emoji && <Entypo name='attachment' size={24} color={'grey'} style={styles.icon}/>}
          {!message &&
            <TouchableOpacity onPress = {addImage}>
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
      {emoji && <View style={[styles.emojiContainer, { height: emojiHeight }]}>
        <EmojiSelector
          category = {Categories.history}
          onEmojiSelected={(emoji) => setMessage(message+emoji)}
          theme = {emojiSearch ? 'transparent' : '#75228f'}
          showHistory = {true}
          columns = {10}
          placeholder = {'Search'}
          showSearchBar = {emojiSearch}
          showSectionTitles = {false}
          showTabs = {!emojiSearch}
        />
      </View>}
    </View>
  )
}

export default InputBox
