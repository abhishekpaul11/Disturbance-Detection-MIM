import React, { useEffect, useState }  from "react";
import { View, Text, Image, TouchableWithoutFeedback} from "react-native";
import { ChatListItemProps } from "../../types";
import styles from "./style";
import moment from "moment";
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from "@react-navigation/native";

const ChatListItem = (props: ChatListItemProps) => {
  const { chatRoom, myID } = props
  const [user, setUser] = useState(null)
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  useEffect(() => {
    const getOtherUser = (async() => {
      const otherUser = chatRoom.chatRoomUser.items.filter((elem) => (elem.user.id != myID))
      setUser(otherUser[0].user)
    })()
  },[])

  if(!user) { return null }

  const onClick = () => {
    navigation.navigate('ChatRoom',{id: chatRoom.id, name: user.name})
  }

  const displayTime = () => {
    const diff = moment().diff(chatRoom.lastMessage.createdAt, 'days')
    if(diff > 1) return moment(chatRoom.lastMessage.createdAt).format('Do MMM \'YY');
    else if (diff == 1) return 'Yesterday'
    else return moment(chatRoom.lastMessage.createdAt).format('h:mm a')
  }

  const displayMessage = () => {
    if(!chatRoom.lastMessage) return 'You are yet to start a conversation'
    const sender = chatRoom.lastMessage.user.id === myID ? 'You: ' : ''
    return sender + chatRoom.lastMessage.content
  }

  return(
    <TouchableWithoutFeedback onPress={onClick}>
      <View style={styles.container}>

          <View style={styles.leftContainer}>

            <Image source={{uri: user.imageUri}} style={styles.avatar}/>

            <View style={styles.midContainer}>

              <View style={styles.upperContainer}>
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.username,{color: Colors[colorScheme].text}]}>{user.name}</Text>
                <Text style={styles.time}>{chatRoom.lastMessage && displayTime()}</Text>
              </View>

              <Text numberOfLines={1} ellipsizeMode={'tail'} style={chatRoom.lastMessage ? styles.lastMessage : [styles.lastMessage, { fontStyle: 'italic'}]}>{displayMessage()}</Text>
            </View>

          </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default ChatListItem;
