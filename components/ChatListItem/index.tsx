import  * as React  from "react";
import { View, Text, Image} from "react-native";
import { ChatListItemProps } from "../../types";
import styles from "./style";
import moment from "moment";

const ChatListItem = (props: ChatListItemProps) => {
  const { chatRoom } = props
  const user = chatRoom.users[1]
  console.log(user.imageUri)
  return(
    <View style={styles.container}>

        <View style={styles.leftContainer}>

          <Image source={{uri: user.imageUri}} style={styles.avatar}/>

          <View style={styles.midContainer}>

            <View style={styles.upperContainer}>
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.username}>{user.name}</Text>
              <Text style={styles.time}>
                {moment(chatRoom.lastMessage.createdAt).format('DD/MM/YYYY')}
              </Text>
            </View>

            <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.lastMessage}>{chatRoom.lastMessage.content}</Text>
          </View>

        </View>
    </View>
  )
}

export default ChatListItem;
