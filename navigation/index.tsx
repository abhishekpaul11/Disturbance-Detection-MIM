/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName, View } from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ContactsScreen from "../screens/ContactsScreen";
import ImageFullScreen from "../screens/ImageFullScreen";
import { RootStackParamList } from '../types';
import MainTabNavigator from './MainTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors';
import { Octicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

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
          <View style={{flexDirection: 'row', width: 60, justifyContent: 'space-between', marginRight: 10}}>
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
        headerLeft: () => (
          <HeaderBackButton tintColor={'white'} onPress={()=>{navigation.navigate('Chats')}}/>
        ),
        headerRight: () => (
          <View style={{flexDirection: 'row', width: 100, justifyContent: 'space-between', marginRight: 10}}>
            <FontAwesome5 name='video' size={22} color={'white'} />
            <MaterialIcons name='call' size={22} color={'white'} />
            <MaterialCommunityIcons name='dots-vertical' size={24} color={'white'} />
          </View>
        )
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
