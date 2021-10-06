import  * as React  from "react";
import { View, Text, Image, TouchableWithoutFeedback} from "react-native";
import { ContactListItemProps } from "../../types";
import styles from "./style";
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from "@react-navigation/native";

import { API, graphqlOperation, Auth } from "aws-amplify";
import { createChatRoom, createChatRoomUser } from "../../src/graphql/mutations";
import { getChatUsers } from "../../src/graphql/queries";

const ContactListItem = (props: ContactListItemProps) => {
  const { user } = props
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  const openChat = (chatRoomID, name) => {
    navigation.navigate('ChatRoom',{
      id: chatRoomID,
      name: name
    })
  }

  const onClick = async() => {
    //navigate to chat room with this user
    const userInfo = await Auth.currentAuthenticatedUser()
    const chatUsers = await API.graphql(graphqlOperation(getChatUsers, {
       id: userInfo.attributes.sub
    }))
    const chatRooms = chatUsers.data.getUser.chatRoomUser.items
    var contacts = chatRooms.map((obj) => (obj.chatRoom.chatRoomUser.items))
    contacts = contacts.reduce((arr, contact) => (arr.concat(contact)))
    const currentContact = contacts.find((contact) => (contact.userID === user.id))
    if(!currentContact){
        try {
          //create a ChatRoom
          const newChatRoomData = await API.graphql(graphqlOperation(createChatRoom, {
            input: {}
          }))
          if(!newChatRoomData.data){
            console.log('Failed to create a new Chat Room')
            return
          }
          newChatRoom = newChatRoomData.data.createChatRoom

          //add this user to Chat Room
          await API.graphql(graphqlOperation(createChatRoomUser, {
            input: {
              userID: user.id,
              chatRoomID: newChatRoom.id
            }
          }))

          //add authenticated user to Chat Room
          await API.graphql(graphqlOperation(createChatRoomUser, {
            input: {
              userID: userInfo.attributes.sub,
              chatRoomID: newChatRoom.id
            }
          }))
          openChat(newChatRoom.id, user.name)
        }
        catch(e) { console.log(e) }
    }
    else { openChat(currentContact.chatRoomID, user.name) }
  }

  return(
    <TouchableWithoutFeedback onPress={onClick}>
      <View style={styles.container}>
          <View style={styles.leftContainer}>

            <Image source={{uri: user.imageUri}} style={styles.avatar}/>

            <View style={styles.midContainer}>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.username,{color: Colors[colorScheme].text}]}>{user.name}</Text>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.lastMessage}>{user.status}</Text>
            </View>

          </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default ContactListItem;
