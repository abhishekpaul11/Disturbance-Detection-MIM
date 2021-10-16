import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ChatListItem from "../components/ChatListItem";
import NewMessageButton from "../components/NewMessageButton";

import { Auth, API, graphqlOperation } from 'aws-amplify'
import { getChatListItem } from "../src/graphql/queries";
import { onMessageCreatedByChatRoomID, onChatRoomUserCreatedByUserID } from "../src/graphql/subscriptions";

import EditScreenInfo from '../components/EditScreenInfo';
import { View, Text } from '../components/Themed';

export default function ChatScreen() {

  const [chatRooms, setChatRooms] = useState([])
  const [flag, forceUpdate] = useState()
  const [prompt, setPrompt] = useState(false)
  const subscriptions = []

  const fetchChatRooms = (async() => {
     try{
       const userInfo = await Auth.currentAuthenticatedUser()
       const userData = await API.graphql(graphqlOperation(getChatListItem, {
         id: userInfo.attributes.sub
       }))
       const chats = userData.data.getUser.chatRoomUser.items.filter((item) => (item.chatRoom.lastMessage))
       chats.sort((a,b) => (new Date(a.chatRoom.lastMessage.createdAt) < new Date(b.chatRoom.lastMessage.createdAt)))
       setPrompt(true)
       setChatRooms(chats)
       return userData.data.getUser.chatRoomUser.items
     }
     catch(e) { console.log(e) }
  })

  useEffect(() => {
    const subscribe = (async() => {
      const chatRoomUsers = await fetchChatRooms()
      chatRoomUsers.forEach(element => {
        subscriptions.push(API.graphql({
          query: onMessageCreatedByChatRoomID,
          variables: { chatRoomID: element.chatRoom.id }
        }).subscribe({
          next: (data) => {
            fetchChatRooms()
          }
        })
       )
     })
   })()
   return () => { subscriptions.forEach(element => { element.unsubscribe() })}
 },[flag])

 useEffect(() => {
   var sub
   const subscribe = (async() => {
     const userInfo = await Auth.currentAuthenticatedUser()
     sub = API.graphql({
       query: onChatRoomUserCreatedByUserID,
       variables: { userID: userInfo.attributes.sub }
     }).subscribe({
       next: (data) => {
         forceUpdate(data.value.data.onChatRoomUserCreatedByUserID.id)
       }
     })
   })()
   return () => sub.unsubscribe()
 },[])

  return (
    <View style={styles.container}>
      {chatRooms.length==0 && prompt && <Text style={styles.text}>{'No existing chats\nOpen contacts to start a conversation'}</Text>}
      <FlatList
        data = {chatRooms}
        renderItem = {({item}) => <ChatListItem chatRoom={item.chatRoom} myID={item.userID}/>}
        keyExtractor = {(item => item.chatRoom.id)}
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
  },
  text: {
    fontSize: 16,
    color: 'grey',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '50%'
  }
});
