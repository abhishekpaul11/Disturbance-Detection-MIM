import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatMessage from "../components/ChatMessage/index";
import InputBox from "../components/InputBox/index";
import background from "../assets/images/bricks.png";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { messagesByChatRoom } from "../src/graphql/queries";

const ChatRoomScreen = () => {
  const route = useRoute()
  const [messages, setMessages] = useState([])
  const [myID, setMyID] = useState(null)

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
