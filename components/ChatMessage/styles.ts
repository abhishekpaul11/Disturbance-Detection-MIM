import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    padding: 3,
  },
  messageBox: {
    borderRadius: 10,
    padding: 10
  },
  name: {
    color: Colors['light'].tint,
    fontWeight: 'bold',
    marginBottom: 2
  },
  message: {
    fontSize: 16
  },
  time: {
    alignSelf: 'flex-end',
    color: 'gray',
    fontSize: 13
  }
})

export default styles
