import React, { useState } from 'react';
import { StyleSheet, Image } from "react-native";
import { View, Text } from '../components/Themed';
import { UserData } from "../atoms/HelperStates";
import { useRecoilState } from "recoil";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Colors from "../constants/Colors";
import useColorScheme from '../hooks/useColorScheme';

const SettingsScreen = () => {

   const [userData] = useRecoilState(UserData)
   const colorScheme = useColorScheme()
   const [imgDisplay, setImgDisplay] = useState('none')

   return (
     <View style={styles.container}>

        <View style={[styles.topBar, {borderBottomColor: Colors[colorScheme].settingsSeparator}]}>
          {userData.imageUri != 'none' && <Image source={{uri: userData.imageUri}} style={[styles.image, { display: imgDisplay }]} onLoad={() => setImgDisplay('flex')}/>}
          {(userData.imageUri == 'none' || imgDisplay == 'none') &&
            <View style={[styles.image, {backgroundColor: Colors[colorScheme].contactBackground}]}>
              <Ionicons name="person" size={36} color={colorScheme == 'light' ? Colors.light.tint : Colors.dark.tabs} />
            </View>
          }
          <View style={styles.textBox}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode={'tail'}>{userData.name}</Text>
            <Text style={[styles.status, {color: colorScheme == 'light' ? 'gray' : '#8a969c'}]} numberOfLines={1} ellipsizeMode={'tail'}>{userData.status}</Text>
          </View>
        </View>

        <View style={styles.optionBar}>
          <Ionicons name="color-palette" size={34} color={Colors[colorScheme].settingsIcons} />
          <View style={styles.optionText}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{'Tint Colour'}</Text>
            <Text style={[styles.subTitle, {color: Colors[colorScheme].settingsSecondary}]} numberOfLines={1} ellipsizeMode={'tail'}>{'Choose your own accent color'}</Text>
          </View>
        </View>

        <View style={styles.optionBar}>
          <MaterialCommunityIcons name="theme-light-dark" size={34} color={Colors[colorScheme].settingsIcons} />
          <View style={styles.optionText}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{'App Theme'}</Text>
            <Text style={[styles.subTitle, {color: Colors[colorScheme].settingsSecondary}]} numberOfLines={1} ellipsizeMode={'tail'}>{'Light mode, dark mode, system default'}</Text>
          </View>
        </View>

        <View style={styles.optionBar}>
          <MaterialCommunityIcons name="wallpaper" size={34} color={Colors[colorScheme].settingsIcons} />
          <View style={styles.optionText}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{'Chat Wallpapers'}</Text>
            <Text style={[styles.subTitle, {color: Colors[colorScheme].settingsSecondary}]} numberOfLines={1} ellipsizeMode={'tail'}>{'Choose your own chat background'}</Text>
          </View>
        </View>

        <View style={styles.optionBar}>
          <FontAwesome name="sign-out" size={37} color={Colors[colorScheme].settingsIcons} />
          <View style={styles.optionText}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{'Sign Out'}</Text>
            <Text style={[styles.subTitle, {color: Colors[colorScheme].settingsSecondary}]} numberOfLines={1} ellipsizeMode={'tail'}>{'Logout from your account'}</Text>
          </View>
        </View>

     </View>
   )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1
  },
  image: {
    height: 70,
    width: 70,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textBox: {
    padding: 15,
    justifyContent: 'space-around',
    flex: 1
  },
  name: {
    fontSize: 20
  },
  status: {
    fontSize: 16
  },
  optionBar: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%'
  },
  title: {
    fontSize: 18,
    paddingVertical: 2
  },
  subTitle: {
    fontSize: 16,
    paddingVertical: 2,
    fontStyle: 'italic'
  },
  optionText: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    flex: 1
  },
})

export default SettingsScreen
