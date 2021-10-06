import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ChatListItem from "../components/ChatListItem";
import NewMessageButton from "../components/NewMessageButton";

import { Auth, API, graphqlOperation } from 'aws-amplify'
import { getChatListItem } from "../src/graphql/queries";

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';

export default function ChatScreen() {

  const [chatRooms, setChatRooms] = useState()

  useEffect(() => {
    const fetchChatRooms = (async() => {
       try{
         const userInfo = await Auth.currentAuthenticatedUser()
         const userData = await API.graphql(graphqlOperation(getChatListItem, {
           id: userInfo.attributes.sub
         }))
         setChatRooms(userData.data.getUser.chatRoomUser.items)
       }
       catch(e) { console.log(e) }
    })()
  },[])
  return (
    <View style={styles.container}>
      <FlatList
        data = {chatRooms}
        renderItem = {({item}) => <ChatListItem chatRoom={item.chatRoom} />}
        keyExtractor = {(item => item.id)}
      />
      <NewMessageButton/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
