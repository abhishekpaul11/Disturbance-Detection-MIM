import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from "react-native";
import { RecoilRoot } from "recoil"

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify'
import { getUser } from "./src/graphql/queries";
import { createUser } from "./src/graphql/mutations";
import config from './aws-exports'
import { RootSiblingParent } from 'react-native-root-siblings';
Amplify.configure(config)

import { withAuthenticator } from 'aws-amplify-react-native'

const App = () => {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  LogBox.ignoreLogs(['Setting a timer']);

  //run this snippet only when App is first mounted
  useEffect(() => {
    const fetchUser = (async() => {
      //get authenticated user from Auth
      const userInfo = await Auth.currentAuthenticatedUser()
      if(userInfo){
        //get user from Backend with the user ID from auth
        const userData = await API.graphql(graphqlOperation(getUser, {
          id: userInfo.attributes.sub
        }))
        if(userData.data.getUser){
          console.log('User is already present in database')
          return
        }

        //if there is no user with ID in db, then create one
        const newUser = {
          id: userInfo.attributes.sub,
          name: userInfo.username.charAt(0).toUpperCase() + userInfo.username.slice(1),
          imageUri: 'none',
          status: 'Focusing'
        }
        await API.graphql(graphqlOperation(createUser, {
          input: newUser
        }))
      }
    })()
  }, [])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <RootSiblingParent>
          <RecoilRoot>
            <Navigation colorScheme={colorScheme} />
          </RecoilRoot>
          <StatusBar style={'light'}/>
        </RootSiblingParent>
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App)
