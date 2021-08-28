import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ChatListItem from "../components/ChatListItem";
import NewMessageButton from "../components/NewMessageButton";
import chatRooms from "../data/ChatRooms.ts";

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data = {chatRooms}
        renderItem = {({item}) => <ChatListItem chatRoom={item} />}
        keyExtractor = {(item => item.id)}
      />
      <NewMessageButton/>
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
