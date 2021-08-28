import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./styles";

const newMessageButton = () => {

  const navigation = useNavigation()

  const onPress = () => {
    navigation.navigate('Contacts')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <MaterialCommunityIcons
          name='message-reply-text'
          size={30}
          color={'white'}
        />
      </TouchableOpacity>
    </View>
  )
}

export default newMessageButton
