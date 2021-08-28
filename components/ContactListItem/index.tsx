import  * as React  from "react";
import { View, Text, Image, TouchableWithoutFeedback} from "react-native";
import { ContactListItemProps } from "../../types";
import styles from "./style";
import moment from "moment";
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';
import { useNavigation } from "@react-navigation/native";

const ContactListItem = (props: ContactListItemProps) => {
  const { user } = props
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  const onClick = () => {
    //navigate to chat room with this user
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
