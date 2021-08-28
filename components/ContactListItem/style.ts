import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      padding: 10,
    },
    leftContainer: {
      flexDirection: 'row'
    },
    username: {
      fontWeight: 'bold',
      fontSize: 16,
      height: 20,
      width: 315
    },
    midContainer: {
      justifyContent: 'space-around',
    },
    avatar: {
      width: 60,
      height: 60,
      marginRight: 12,
      borderRadius: 50
    },
    lastMessage: {
      fontSize: 16,
      color: 'grey',
      height: 20,
      width: 315
    }
})

export default styles
