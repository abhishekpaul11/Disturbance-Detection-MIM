import React from "react";
import { FlatList, ImageBackground } from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatRoomData from "../data/Chats";
import ChatMessage from "../components/ChatMessage/index";
import InputBox from "../components/InputBox/index";
import background from "../assets/images/bricks.png";

const ChatRoomScreen = () => {
  const route = useRoute()

  return (
    <ImageBackground style={{width: '100%', height: '100%'}} source = {background}>
      <FlatList
        data = {ChatRoomData.messages}
        renderItem={({item}) => <ChatMessage message={item} />}
        inverted
      />
    <InputBox/>
    </ImageBackground>
  )
}

export default ChatRoomScreen
