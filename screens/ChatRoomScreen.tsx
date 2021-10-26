import React, { useEffect, useState, useRef } from "react";
import { FlatList, ImageBackground, Text, StyleSheet, View, Keyboard, BackHandler } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ChatMessage from "../components/ChatMessage/index";
import ImageSelect from "../components/ImageSelect/index";
import InputBox from "../components/InputBox/index";
import background from "../assets/images/bricks.png";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { messagesByChatRoom } from "../src/graphql/queries";
import { updateChatRoom } from "../src/graphql/mutations";
import { onIncomingMessage } from "../src/graphql/subscriptions";
import BottomSheet from '@gorhom/bottom-sheet';

const ChatRoomScreen = () => {
  const route = useRoute()
  const [messages, setMessages] = useState([])
  const [myID, setMyID] = useState(null)
  const [myName, setMyName] = useState(null)
  const [flag, setFlag] = useState(false)
  const [snapLock, setSnapLock] = useState(true)
  const navigation = useNavigation()
  var subscriptions = []
  const bottomSheetRef = useRef<BottomSheet>(null);

  function handleBackButtonClick() {
    bottomSheetRef?.current?.close()
    navigation.navigate('Chats');
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  },[]);

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
        data = {messages}
        renderItem={({item}) => <ChatMessage message={item} id={myID} bottomSheetRef={bottomSheetRef}/>}
        keyExtractor={(item) => item.createdAt}
        inverted
      />
      {messages.length==0 && flag && <Text style={styles.text}>{'You are yet to start a conversation\nSay \'Hi\' to '+route.params.name}</Text>}
      <InputBox chatRoomID={route.params.id} addMessage={addMyMessage} sendImage = {sendImage}/>
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
  }
})

export default ChatRoomScreen
