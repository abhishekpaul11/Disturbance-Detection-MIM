import  React, { useEffect, useState }  from "react";
import { View, Text, Image } from "react-native";
import { ContactListItemProps } from "../../types";
import styles from "./style";
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from "@react-navigation/native";
import { TouchableRipple } from "react-native-paper";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createChatRoom, createChatRoomUser } from "../../src/graphql/mutations";
import { getChatUsers } from "../../src/graphql/queries";
import { onUserUpdatedByUserID } from "../../src/graphql/subscriptions";

const ContactListItem = (props: ContactListItemProps) => {
  const { data } = props
  const [user, setUser] = useState(data)
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  var flag = true

  const openChat = (chatRoomID, users, name, isImportant, chatRoomUser) => {
    navigation.navigate('ChatRoom',{
      id: chatRoomID,
      users,
      name,
      isImportant,
      chatRoomUser
    })
  }

  useEffect(() => {
    const sub = API.graphql({
      query: onUserUpdatedByUserID,
      variables: { id: user.id }
    }).subscribe({
      next: (data) => {
        setUser(data.value.data.onUserUpdatedByUserID)
      }
    })
    return () => sub.unsubscribe()
  },[])

  const onClick = async() => {
    //navigate to chat room with this user
    if(flag){
      flag = false
      const userInfo = await Auth.currentAuthenticatedUser()
      const chatUsers = await API.graphql(graphqlOperation(getChatUsers, {
         id: userInfo.attributes.sub
      }))
      const chatRooms = chatUsers.data.getUser.chatRoomUser.items
      var contacts = chatRooms.map((obj) => (obj.chatRoom.chatRoomUser.items))
      if(contacts.length != 0) contacts = contacts.reduce((arr, contact) => (arr.concat(contact)))
      const currentContact = contacts.find((contact) => (contact.userID === user.id))
      if(!currentContact){
          try {
            //create a ChatRoom
            const newChatRoomData = await API.graphql(graphqlOperation(createChatRoom, {
              input: {
                lastMessageID: ''
              }
            }))
            if(!newChatRoomData.data){
              console.log('Failed to create a new Chat Room')
              return
            }
            const newChatRoom = newChatRoomData.data.createChatRoom

            const [, myChatRoomUser] = await Promise.all([
              //add this user to Chat Room
              API.graphql(graphqlOperation(createChatRoomUser, {
                input: {
                  userID: user.id,
                  chatRoomID: newChatRoom.id,
                  isImportant: false
                }
              })),

              //add authenticated user to Chat Room
              API.graphql(graphqlOperation(createChatRoomUser, {
                input: {
                  userID: userInfo.attributes.sub,
                  chatRoomID: newChatRoom.id,
                  isImportant: false
                }
              }))
            ])
            openChat(newChatRoom.id, [{user}], user.name, false, myChatRoomUser.data.createChatRoomUser)
          }
          catch(e) { console.log(e) }
      }
      else {
        const myContact = contacts.find((contact) => (contact.userID === userInfo.attributes.sub && contact.chatRoomID === currentContact.chatRoomID))
        openChat(currentContact.chatRoom.id, [{user}], user.name, myContact.isImportant, myContact)
      }
      flag = true
    }
  }

  return(
    <TouchableRipple onPress={onClick} rippleColor={Colors[colorScheme].rippleColor}>
      <View style={styles.container}>
          <View style={styles.leftContainer}>

            <Image source={{uri: user.imageUri}} style={styles.avatar}/>

            <View style={styles.midContainer}>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.username,{color: Colors[colorScheme].text}]}>{user.name}</Text>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.lastMessage}>{user.status}</Text>
            </View>

          </View>
      </View>
    </TouchableRipple>
  )
}

export default ContactListItem;
