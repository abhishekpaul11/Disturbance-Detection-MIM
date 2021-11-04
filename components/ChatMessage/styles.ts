import { StyleSheet, Dimensions } from "react-native";
import Colors from "../../constants/Colors";

const windowHeight = Dimensions.get('window').height;

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
    minWidth: '100%',
    borderRadius: 8,
    maxHeight: 350/823 * windowHeight
  },
  activityIndicator: {
    position: 'absolute',
    top: '45%',
    left: '45%'
  }
})

export default styles
