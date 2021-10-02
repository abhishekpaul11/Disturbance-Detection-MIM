import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify'
import { getUser } from "./src/graphql/queries";
import { createUser } from "./src/graphql/mutations";
import config from './aws-exports'
Amplify.configure(config)

import { withAuthenticator } from 'aws-amplify-react-native'

const App = () => {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  //run this snippet only when App is first mounted
  useEffect(() => {
    const fetchUser = (async() => {
      //get authenticated user from Auth
      const userInfo = await Auth.currentAuthenticatedUser({ bypassCache: true })
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
          name: userInfo.username,
          imageUri: 'https://us.123rf.com/450wm/happyvector071/happyvector0711904/happyvector071190416116/120957921-creative-illustration-of-default-avatar-profile-placeholder-isolated-on-background-art-design-grey-p.jpg?ver=6',
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
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App)
