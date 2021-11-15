import React, { useEffect, useState, useRef } from "react";
import { FlatList, ImageBackground, Text, StyleSheet, View, Keyboard, BackHandler, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ChatMessage from "../components/ChatMessage/index";
import ImageSelect from "../components/ImageSelect/index";
import InputBox from "../components/InputBox/index";
import background from "../assets/images/bricks.png";
import { useRecoilState } from "recoil";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { messagesByChatRoom } from "../src/graphql/queries";
import { updateChatRoom } from "../src/graphql/mutations";
import { onIncomingMessage } from "../src/graphql/subscriptions";
import BottomSheet from '@gorhom/bottom-sheet';
import { workmode } from "../atoms/WorkMode";

const ChatRoomScreen = () => {
  const route = useRoute()
  const [messages, setMessages] = useState([])
  const [myID, setMyID] = useState(null)
  const [myName, setMyName] = useState(null)
  const [flag, setFlag] = useState(false)
  const [snapLock, setSnapLock] = useState(true)
  const emo = useRef(null)
  const [showEmo, hideEmo] = useState(true)
  const navigation = useNavigation()
  var subscriptions = []
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatlist = useRef<FlatList>(null)
  const [globalWorkMode] = useRecoilState(workmode)

  const getEmoji = (emoji) => { emo.current = emoji }

  function handleBackButtonClick() {
    bottomSheetRef?.current?.close()
    if(emo.current) hideEmo(!showEmo)
    else navigation.navigate(!globalWorkMode ? 'Chats' : route.params.isImportant ? 'ImportantContacts' : 'Chats')
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  },[showEmo, globalWorkMode]);

  const updateChatRoomLastMessage = async(messageID: string) => {
    try{
      await API.graphql(graphqlOperation(updateChatRoom, {
        input: {
          id: route.params.id,
          lastMessageID: messageID
        }
      }))
    }
    catch(e) { console.log(e) }
  }

  useEffect(() => {
    const fetchMessages = (async() => {
      const msgs = await API.graphql(graphqlOperation(messagesByChatRoom, {
        chatRoomID: route.params.id,
        sortDirection: "DESC"
      }))
      setFlag(true)
      setMessages(msgs.data.messagesByChatRoom.items)
    })()
  },[])

  useEffect(() => {
    const otherUsers = route.params.users
    otherUsers.forEach((elem) => {
      subscriptions.push(API.graphql({
        query: onIncomingMessage,
        variables: { chatRoomID: route.params.id, userID: elem.user.id }
      }).subscribe({
        next: (data) => {
          const newMessage = data.value.data.onIncomingMessage
          setMessages([newMessage, ...messages])
          updateChatRoomLastMessage(newMessage.id)
        }
      }))
    })
    return () => { subscriptions.forEach((sub) => sub.unsubscribe()) }
  })

  const addMyMessage = (myMessage) => {
    setMessages([myMessage, ...messages])
  }

  useEffect(() => {
    const getID = (async() => {
      const userInfo = await Auth.currentAuthenticatedUser()
      setMyID(userInfo.attributes.sub)
      setMyName(userInfo.signInUserSession.accessToken.payload.username)
    })()
  },[])

  const sendImage = () => {
    Keyboard.dismiss()
    bottomSheetRef?.current?.snapToIndex(0)
  }

  return (
    <ImageBackground style={styles.background} source = {background}>
      <FlatList
        ref = {flatlist}
        keyboardShouldPersistTaps={'always'}
        data = {messages}
        renderItem={({item}) => <ChatMessage message={item} id={myID} bottomSheetRef={bottomSheetRef}/>}
        keyExtractor={(item) => item.user.name + item.createdAt}
        inverted
      />
      {!flag && <ActivityIndicator size={'large'} color={'#75228f'} style={styles.loading}/>}
      {messages.length==0 && flag && <Text style={styles.text}>{'You are yet to start a conversation\nSay \'Hi\' to '+route.params.name}</Text>}
      <InputBox flatlist={flatlist} isFirst={messages.length==0} chatRoomID={route.params.id} addMessage={addMyMessage} sendImage = {sendImage} getEmoji={getEmoji} showEmo={showEmo}/>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['23%']}
        enablePanDownToClose={snapLock}
      >
      <ImageSelect id={myID} name={myName} chatRoomID={route.params.id} addImage={addMyMessage} setSnapLock={setSnapLock} bottomSheetRef={bottomSheetRef}/>
      </BottomSheet>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%'
  },
  text: {
    fontSize: 16,
    color: 'grey',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: '15%'
  },
  loading: {
    top: '45%',
    left: '45%',
    position: 'absolute'
  }
})

export default ChatRoomScreen
