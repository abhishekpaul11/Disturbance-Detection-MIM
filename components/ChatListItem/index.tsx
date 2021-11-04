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

import { API } from "aws-amplify";
import { onUserUpdatedByUserID } from "../../src/graphql/subscriptions";

const ChatListItem = (props: ChatListItemProps) => {
  const { chatRoom, myID } = props
  const [user, setUser] = useState(null)
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

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
    navigation.navigate('ChatRoom',{id: chatRoom.id, users, name: user.name})
  }

  const displayTime = () => {
    const diff = moment().diff(chatRoom.lastMessage.createdAt, 'days')
    if(diff > 1) return moment(chatRoom.lastMessage.createdAt).format('Do MMM \'YY');
    else if (diff == 1) return 'Yesterday'
    else return moment(chatRoom.lastMessage.createdAt).format('h:mm a')
  }

  const displayMessage = () => {
    return chatRoom.lastMessage.isImage ? ' Photo' : chatRoom.lastMessage.content
  }

  return(
    <TouchableRipple onPress={onClick} rippleColor={colorScheme == 'dark' ? '#cccccc42' : '#ccc'}>
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
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.lastMessage,{flex: 1}]}>{displayMessage()}</Text>
              </View>
            </View>

          </View>
      </View>
    </TouchableRipple>
  )
}

export default ChatListItem;
