import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { ImportantMessages, workmode } from "../atoms/WorkMode";
import { useRecoilState } from "recoil";
import { Auth, API, graphqlOperation } from 'aws-amplify'
import { batchGetMessages } from "../src/graphql/queries";
import ChatMessage from "../components/ChatMessage";

import { Text, View } from '../components/Themed';

export default function ImportantMessagesScreen() {

  const [importantMessages] = useRecoilState(ImportantMessages)
  const [myID, setMyID] = useState(null)
  const [messages, setMessages] = useState(['empty'])
  const [workMode] = useRecoilState(workmode)

  useEffect(() => {
    const getID = (async() => {
      const userInfo = await Auth.currentAuthenticatedUser()
      setMyID(userInfo.attributes.sub)
    })()
  },[])

  useEffect(() => {
    if(importantMessages.length == 0 || importantMessages[0] !== 'empty'){
      if(importantMessages.length > 0){
        const getMessages = (async() => {
          const msgs = await API.graphql(graphqlOperation(batchGetMessages, {
            ids: importantMessages
          }))
          const orderedMsgs = msgs.data.batchGetMessages.sort((a,b) => (new Date(a.createdAt) < new Date(b.createdAt)))
          setMessages(orderedMsgs)
        })()
      }
      else setMessages([])
    }
  },[importantMessages])

  const renderSeparator = () => (
    <View style={styles.separator}/>
  );

  if(!workMode)
    return (
      <View style={[styles.container, {paddingHorizontal: 10}]}>
        <Text style={styles.text}>{'Work Mode is OFF\nTurn it ON to view Messages marked as \'Important\''}</Text>
      </View>
    );

  if(messages[0] === 'empty')
    return(
      <View style={styles.container}>
        <ActivityIndicator size={'large'} color={'#75228f'} style={styles.loading}/>
      </View>
    )

  return(
    <View style={messages.length==0 ? [styles.container, {paddingHorizontal: 10}] : {flex: 1, paddingVertical: 10}}>
      {messages.length==0 && <Text style={[styles.text, {marginTop: '55%'}]}>{'No messages were marked as \'Important\''}</Text>}
      <FlatList
        data = {myID!==null ? messages : []}
        renderItem = {({item}) => <ChatMessage message={item} id={myID} impName={true}/>}
        keyExtractor={(item) => item.user.name + item.createdAt}
        ItemSeparatorComponent={renderSeparator}
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
    textAlign: 'center',
    marginBottom: '55%'
  },
  loading: {
    bottom: '15%'
  },
  separator: {
    height: 2,
    margin: 5,
    backgroundColor: '#ccc'
  }
});
