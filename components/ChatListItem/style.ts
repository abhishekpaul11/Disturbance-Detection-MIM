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
      width: '64%'
    },
    midContainer: {
      justifyContent: 'space-around',
      width: '81%',
      marginLeft: 'auto'
    },
    upperContainer: {
      flexDirection: 'row',
    },
    lastMessage: {
      fontSize: 16,
      color: 'grey',
      height: 20,
    },
    time:{
      fontSize: 13,
      color: 'grey',
      paddingRight: 5,
      marginLeft: 'auto',
      alignSelf: 'flex-end'
    },
    avatar: {
      width: 60,
      height: 60,
      marginRight: 12,
      borderRadius: 50
    }
})

export default styles
