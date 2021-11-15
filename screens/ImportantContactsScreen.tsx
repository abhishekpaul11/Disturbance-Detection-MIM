import * as React from 'react';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ChatListItem from "../components/ChatListItem";
import { ImportantChats, workmode } from "../atoms/WorkMode";
import { useRecoilState } from "recoil";

import { Text, View } from '../components/Themed';

export default function ImportantContactsScreen() {

  const [workMode] = useRecoilState(workmode)
  const [impChats] = useRecoilState(ImportantChats)

  if(!workMode)
    return (
      <View style={[styles.container, {paddingHorizontal: 10}]}>
        <Text style={[styles.text, {marginBottom: '55%'}]}>{'Work Mode is OFF\nTurn it ON to view Contacts marked as \'Important\''}</Text>
      </View>
    );

  if(impChats[0] === 'empty')
    return(
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={'#75228f'} style={styles.loading}/>
      </View>
    )

  return(
    <View style={[styles.container, {paddingHorizontal: impChats.length == 0 ? 10 : 0}]}>
      {impChats.length==0 && <Text style={[styles.text, {marginTop: '55%'}]}>{'No chats were marked as \'Important\''}</Text>}
      <FlatList
        data = {impChats}
        renderItem = {({item}) => <ChatListItem chatRoomUser={item} myID={item.userID} />}
        keyExtractor = {(item => item.chatRoom.id)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: 'grey',
    fontStyle: 'italic',
    textAlign: 'center'
  }
});
