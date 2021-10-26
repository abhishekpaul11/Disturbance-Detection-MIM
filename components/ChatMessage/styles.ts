import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    padding: 3,
  },
  messageBox: {
    borderRadius: 10
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
  },
  image: {
    aspectRatio: 1/1.25,
    width: 260,
    borderRadius: 10
  },
  activityIndicator: {
    position: 'absolute',
    top: '45%',
    left: '45%'
  }
})

export default styles
