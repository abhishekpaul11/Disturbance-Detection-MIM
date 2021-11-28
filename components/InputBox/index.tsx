import React, { useState, useEffect, useRef } from "react";
import { TextInput, View, TouchableOpacity, Keyboard, AsyncStorage } from "react-native";
import styles from "./styles";
import moment from "moment";
import { MaterialCommunityIcons, FontAwesome5, Entypo, Ionicons, MaterialIcons, Octicons, AntDesign } from "@expo/vector-icons";
import EmojiSelector, { Categories} from 'react-native-emoji-selector'
import { Emoji } from "../../atoms/HelperStates";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";
import { SentMessages } from "../../atoms/WorkMode";
import { useRecoilState } from "recoil";

const InputBox = (props) => {

  const { chatRoomID, isFirst, addMessage, sendImage, getEmoji, showEmo, flatlist } = props
  const [message, setMessage] = useState('')
  const [myUserID, setMyUserID] = useState(null)
  const [myName, setMyName] = useState(null)
  const [emoji, showEmoji] = useState(false)
  const [emojiHeight, setEmojiHeight] = useState(318)
  const [emojiSearch, setEmojiSearch] = useState(false)
  const keyboard = useRef(null)
  const keyboardHeight = useRef(0)
  const [sentMsgs, setSentMsgs] = useRecoilState(SentMessages)
  const [counter, setCounter] = useState(1)
  const [emojiCheck] = useRecoilState(Emoji)
  var shouldScroll = !isFirst

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

  const checkSpam = (message) => {
    return new Promise(async(resolve, reject) => {
      message = message.replace(/\s+/g, '+')
      try{
        const result = await fetch('https://imtext.herokuapp.com/predict?t='+message)
        const ans = await result.json()
        resolve(ans.results.results)
      }
      catch(e) { resolve(0) }
    })
  }

  const onSendPress = () => {
    //send to backend
    if(message.trim() !== ""){
      addMessage({
        user: {
          name: myName.charAt(0).toUpperCase() + myName.slice(1),
          id: myUserID
        },
        content: message.trim(),
        createdAt: moment().toISOString(),
        isImage: false,
        index: counter
      })
      setMessage('')
      shouldScroll ? flatlist.current.scrollToIndex({index: 0}) :
      shouldScroll = true
      try {
        checkSpam(message.trim()).then(async(result) => {
          const spam = result
          const sentMessage = await API.graphql(graphqlOperation(createMessage, {
            input: {
              content: message.trim(),
              userID: myUserID,
              chatRoomID,
              isImage: false,
              isSpam: spam === 1
            }
          }))
          updateChatRoomLastMessage(sentMessage.data.createMessage.id)
          const newObj = Object.assign({}, sentMsgs)
          newObj[counter] = sentMessage.data.createMessage.id
          setSentMsgs(newObj)
          setCounter(counter+1)
        })
        .catch(err => { console.log(err) })
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

  const handleEmoji = (emoji) => {
    if(!emojiCheck) AsyncStorage.setItem('emoji', 'true')
    setMessage(message+emoji)
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
          category = {emojiCheck ? Categories.history : Categories.emotion}
          onEmojiSelected={(emoji) => handleEmoji(emoji)}
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
