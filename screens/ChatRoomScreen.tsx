import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatMessage from "../components/ChatMessage/index";
import InputBox from "../components/InputBox/index";
import background from "../assets/images/bricks.png";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { messagesByChatRoom } from "../src/graphql/queries";
import { createMessage, updateChatRoom } from "../src/graphql/mutations";
import { onMessageCreatedByChatRoomID } from "../src/graphql/subscriptions";

const ChatRoomScreen = () => {
  const route = useRoute()
  const [messages, setMessages] = useState([])
  const [myID, setMyID] = useState(null)

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
    const getID = (async() => {
      const userInfo = await Auth.currentAuthenticatedUser()
      setMyID(userInfo.attributes.sub)
    })()
  },[])

  useEffect(() => {
    const fetchMessages = (async() => {
      const msgs = await API.graphql(graphqlOperation(messagesByChatRoom, {
        chatRoomID: route.params.id,
        sortDirection: "DESC"
      }))
      setMessages(msgs.data.messagesByChatRoom.items)
    })()
  },[])

  useEffect(() => {
    const subscription = API.graphql({
      query: onMessageCreatedByChatRoomID,
      variables: { chatRoomID: route.params.id }
    }).subscribe({
      next: (data) => {
        const newMessage = data.value.data.onMessageCreatedByChatRoomID
        setMessages([newMessage, ...messages])
        updateChatRoomLastMessage(newMessage.id)
      }
    })
    return () => subscription.unsubscribe()
  })

  return (
    <ImageBackground style={{width: '100%', height: '100%'}} source = {background}>
      <FlatList
        data = {messages}
        renderItem={({item}) => <ChatMessage message={item} id={myID}/>}
        inverted
      />
    <InputBox chatRoomID={route.params.id} />
    </ImageBackground>
  )
}

export default ChatRoomScreen
