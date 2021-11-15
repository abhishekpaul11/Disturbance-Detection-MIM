/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { ColorSchemeName, View, StyleSheet, AsyncStorage } from 'react-native';
import { TouchableRipple } from "react-native-paper";
import { useRecoilState } from "recoil";
import { API, graphqlOperation } from "aws-amplify";

import NotFoundScreen from '../screens/NotFoundScreen';
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ContactsScreen from "../screens/ContactsScreen";
import ImageFullScreen from "../screens/ImageFullScreen";
import { RootStackParamList } from '../types';
import MainTabNavigator from './MainTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors';
import { Octicons, MaterialCommunityIcons, MaterialIcons, Fontisto } from "@expo/vector-icons";
import { workmode, ImportantChats, UnimportantChats, Refresh, StarLock } from "../atoms/WorkMode";
import Toast from 'react-native-root-toast';
import { updateChatRoomUser } from "../src/graphql/mutations";

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {

  const [color, setColor] = useState()
  const [icon, setIcon] = useState()
  const [globalWorkMode, setGlobalWorkMode] = useRecoilState(workmode)
  const [loaded, setLoaded] = useState(false)
  const [starLock, setStarLock] = useRecoilState(StarLock)

  AsyncStorage.getItem('workmode').then(data => {
    const savedColor = data === 'ON' ? 'orange' : 'lightgreen'
    const savedIcon = data === 'ON' ? 'work' : 'work-off'
    const savedMode = data === 'ON' ? true : false
    setColor(savedColor)
    setIcon(savedIcon)
    setGlobalWorkMode(savedMode)
    setLoaded(true)
  });

  const toggleWorkmode = () => {
    const newColor = color === 'lightgreen' ? 'orange' : 'lightgreen'
    const newIcon = icon === 'work-off' ? 'work' : 'work-off'
    setColor(newColor)
    setIcon(newIcon)
    setGlobalWorkMode(!globalWorkMode)
    const keyword = newColor === 'orange' ? 'Enabled' : 'Disabled'
    Toast.show('Work Mode '+keyword+' !!!',{
      duration: 1000,
      position: -100,
      shadow: true,
      animation: true,
      backgroundColor: '#ffffff',
      textColor: 'black',
      shadowColor: 'black',
      opacity: 0.9
    })
    const value = newColor === 'orange' ? 'ON' : 'OFF'
    AsyncStorage.setItem('workmode', value);
  }

  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: Colors.light.tint,
        shadowOpacity: 0,
        elevation: 0
      },
      headerTintColor: Colors.light.background
    }}>
    <Stack.Screen name="Root" component={MainTabNavigator}
      options =  {{
        title: 'Any Cool Name',
        headerRight: () => (
          <View style={styles.rootHeader}>
            {loaded && <TouchableRipple onPress={toggleWorkmode} rippleColor={'#cccccc42'} >
              <View style={styles.workButton}>
                <MaterialIcons name={icon} size={24} color={color} />
              </View>
            </TouchableRipple>}
            <Octicons name='search' size={22} color={'white'}/>
            <MaterialCommunityIcons name='dots-vertical' size={22} color={'white'}/>
          </View>
        )
      }}
    />
    <Stack.Screen
      name="ChatRoom"
      component={ChatRoomScreen}
      options={({ route, navigation }) => ({
        title: route.params.name,
        headerTitleStyle: {
          maxWidth: 195,
        },
        headerLeft: () => (
          <HeaderBackButton tintColor={'white'} onPress={() => navigation.navigate(!globalWorkMode ? 'Chats' : route.params.isImportant ? 'ImportantContacts' : 'Chats')}/>
        ),
        headerRight: () => {
          const [buttonColor, setButtonColor] = useState(route.params.isImportant ? 'gold' : 'white')
          const [importantChats, setImportantChats] = useRecoilState(ImportantChats)
          const [unImpChats, setUnImpChats] = useRecoilState(UnimportantChats)
          const [refresh, setRefresh] = useRecoilState(Refresh)
          const toggleImp = () => {
            if(!globalWorkMode) setStarLock(false)
            const newColor = buttonColor === 'gold' ? 'white' : 'gold'
            API.graphql(graphqlOperation(updateChatRoomUser, {
              input: {
                id: route.params.chatRoomUser.id,
                isImportant: newColor === 'gold'
              }
            }))
            if(route.params.chatRoomUser.chatRoom.lastMessage && globalWorkMode){
              var newChatRoomUser = Object.assign({}, route.params.chatRoomUser)
              newChatRoomUser.isImportant = newColor === 'gold'
              if(newColor === 'white'){
                setImportantChats(importantChats.filter((item) => item.id !== route.params.chatRoomUser.id))
                const chats = [...unImpChats, newChatRoomUser]
                chats.sort((a,b) => (new Date(a.chatRoom.lastMessage.createdAt) < new Date(b.chatRoom.lastMessage.createdAt)))
                setUnImpChats(chats)
              }
              else{
                setUnImpChats(unImpChats.filter((item) => item.id !== route.params.chatRoomUser.id))
                const chats = [...importantChats, newChatRoomUser]
                chats.sort((a,b) => (new Date(a.chatRoom.lastMessage.createdAt) < new Date(b.chatRoom.lastMessage.createdAt)))
                setImportantChats(chats)
              }
            }
            if(!globalWorkMode) setRefresh(!refresh)
            setButtonColor(newColor)
            route.params.isImportant = newColor === 'gold' ? true : false
            const keyword = newColor === 'white' ? 'Unimportant' : 'Important'
            Toast.show('Contact marked as ' + keyword,{
              duration: 1000,
              position: -100,
              shadow: true,
              animation: true,
              backgroundColor: '#ffffff',
              textColor: 'black',
              shadowColor: 'black',
              opacity: 0.9
            })
          }
          return(
            <View style={{flexDirection: 'row', width: 120, justifyContent: 'space-between', marginRight: 10, alignItems: 'center'}}>
              <Fontisto name="star" size={22} color={buttonColor} onPress={globalWorkMode ? toggleImp : starLock ? toggleImp : () => {}}/>
              {loaded && <TouchableRipple onPress={toggleWorkmode} rippleColor={'#cccccc42'} >
                <View style={styles.workButton}>
                  <MaterialIcons name={icon} size={24} color={color} />
                </View>
              </TouchableRipple>}
              <MaterialCommunityIcons name='dots-vertical' size={24} color={'white'} />
            </View>
          )}
      })}
    />
    <Stack.Screen
      name="Contacts"
      component={ContactsScreen}
    />
    <Stack.Screen
      name="ImageFullScreen"
      component={ImageFullScreen}
      options={() => ({
        headerShown: false
      })}
    />
    <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  rootHeader: {
    flexDirection: 'row',
    width: 120,
    justifyContent: 'space-between',
    marginRight: 10,
    alignItems: 'center'
  },
  workButton: {
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
