import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ContactListItem from "../components/ContactListItem";

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';

import { Auth, API, graphqlOperation } from 'aws-amplify'
import { listUsers } from "../src/graphql/queries";

export default function ChatScreen() {

  const[users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = (async() => {
      try{
        const usersData = await await API.graphql(graphqlOperation(listUsers))
        const myData = await Auth.currentAuthenticatedUser({ bypassCache: true })
        const contacts = usersData.data.listUsers.items.filter((user) => user.id != myData.attributes.sub)
        setUsers(contacts)
      }
      catch (e) {}
    })()
  },[])
  return (
    <View style={styles.container}>
      <FlatList
        style={{width:'100%'}}
        data = {users}
        renderItem = {({item}) => <ContactListItem user={item} />}
        keyExtractor = {(item => item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
