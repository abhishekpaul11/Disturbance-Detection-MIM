import React, { useEffect, useState }  from "react";
import { View, Text, Image } from "react-native";
import { ChatListItemProps } from "../../types";
import styles from "./style";
import moment from "moment";
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import { TouchableRipple } from "react-native-paper";
import Toast from 'react-native-root-toast';
import { useRecoilState } from "recoil";
import { ImportantChats, UnimportantChats, workmode, ImportantMessages } from "../../atoms/WorkMode";

import { API, graphqlOperation } from "aws-amplify";
import { onUserUpdatedByUserID } from "../../src/graphql/subscriptions";
import { updateChatRoomUser } from "../../src/graphql/mutations";

const ChatListItem = (props: ChatListItemProps) => {
  const { chatRoomUser, myID } = props
  const chatRoom = chatRoomUser.chatRoom
  const [user, setUser] = useState(null)
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [importantChats, setImportantChats] = useRecoilState(ImportantChats)
  const [unImpChats, setUnImpChats] = useRecoilState(UnimportantChats)
  const [workMode] = useRecoilState(workmode)
  const [important, toggleImp] = useState(chatRoomUser.isImportant)
  const [impMsgs] = useRecoilState(ImportantMessages)

  useEffect(() => {
    const otherUser = chatRoom.chatRoomUser.items.filter((elem) => (elem.user.id != myID))
    setUser(otherUser[0].user)
    const sub = API.graphql({
      query: onUserUpdatedByUserID,
      variables: { id: otherUser[0].user.id }
    }).subscribe({
      next: (data) => {
        setUser(data.value.data.onUserUpdatedByUserID)
      }
    })
    return () => sub.unsubscribe()
  },[])

  if(!user) { return null }

  const onClick = () => {
    const users = chatRoom.chatRoomUser.items.filter((elem) => elem.user.id !== myID)
    navigation.navigate('ChatRoom',{id: chatRoom.id, users, name: user.name, isImportant: important, chatRoomUser, recentImpMsgs: [], userID: myID })
  }

  const displayTime = () => {
    const diff = moment().diff(chatRoom.lastMessage.createdAt, 'days')
    if(diff > 1) return moment(chatRoom.lastMessage.createdAt).format('Do MMM \'YY');
    else if (diff == 1) return 'Yesterday'
    else return moment(chatRoom.lastMessage.createdAt).format('h:mm a')
  }

  const displayMessage = () => {
    return chatRoom.lastMessage.isImage ? ' Photo' : workMode && !important && !impMsgs.includes(chatRoom.lastMessage.id) &&chatRoom.lastMessage.isSpam ? 'Message flagged as Spam' : chatRoom.lastMessage.content
  }

  const toggleImportant = () => {
    const prevStatus = important
    toggleImp(!important)
    const keyword = prevStatus ? 'Unimportant' : 'Important'
    Toast.show('Contact marked as ' + keyword,{
      duration: 1000,
      position: -100,
      shadow: true,
      animation: true,
      backgroundColor: '#ffffff',
      textColor: 'black',
      shadowColor: 'black',
      opacity: 0.9
    })
    var newChatRoomUser = Object.assign({}, chatRoomUser)
    newChatRoomUser.isImportant = !prevStatus
    if(prevStatus){
      setImportantChats(importantChats.filter((item) => item.id !== chatRoomUser.id))
      const chats = [...unImpChats, newChatRoomUser]
      chats.sort((a,b) => (new Date(a.chatRoom.lastMessage.createdAt) < new Date(b.chatRoom.lastMessage.createdAt)))
      setUnImpChats(chats)
    }
    else{
      setUnImpChats(unImpChats.filter((item) => item.id !== chatRoomUser.id))
      const chats = [...importantChats, newChatRoomUser]
      chats.sort((a,b) => (new Date(a.chatRoom.lastMessage.createdAt) < new Date(b.chatRoom.lastMessage.createdAt)))
      setImportantChats(chats)
    }
    API.graphql(graphqlOperation(updateChatRoomUser, {
      input: {
        id: chatRoomUser.id,
        isImportant: !prevStatus
      }
    }))
  }

  return(
    <TouchableRipple onPress={onClick} onLongPress={toggleImportant} rippleColor={Colors[colorScheme].rippleColor} style={{backgroundColor: important ? Colors[colorScheme].important : 'transparent'}}>
      <View style={styles.container}>

          <View style={styles.leftContainer}>

            <Image source={{uri: user.imageUri}} style={styles.avatar}/>

            <View style={styles.midContainer}>

              <View style={styles.upperContainer}>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.username,{color: Colors[colorScheme].text}]}>{user.name}</Text>
                <Text style={styles.time}>{displayTime()}</Text>
              </View>

              <View style={styles.messageContainer}>
                {chatRoom.lastMessage.user.id === myID && <Text style={styles.lastMessage}>You: </Text>}
                {chatRoom.lastMessage.isImage && <FontAwesome name="photo" size={16} color="grey" />}
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={workMode && !important && !impMsgs.includes(chatRoom.lastMessage.id) && chatRoom.lastMessage.isSpam ? [styles.lastMessage,{flex: 1, fontStyle: 'italic'}] : [styles.lastMessage,{flex: 1}]}>{displayMessage()}</Text>
              </View>
            </View>

          </View>
      </View>
    </TouchableRipple>
  )
}

export default ChatListItem;
