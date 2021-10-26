import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import * as ImagePicker from 'expo-image-picker';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import moment from "moment";
import { Storage } from 'aws-amplify'
import { API, graphqlOperation, Auth } from "aws-amplify";
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";

const ImageSelect = ({ id, name, chatRoomID, addImage, setSnapLock, bottomSheetRef }) => {

  const [image, setImage] = useState(null);
  const [percentage, setPercentage] = useState(-1)

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  },[]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    handleImagePicked(result)
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    handleImagePicked(result);
  };

  const handleImagePicked = async(result) => {
    if (!result.cancelled) {
      setSnapLock(false)
      setPercentage(0)
      const img = await fetchImageFromUri(result.uri)
      const key = await uploadImage('images/'+name+'/MIM-'+moment.now()+'.jpg',img)
      bottomSheetRef?.current?.close()
      setPercentage(-1)
      setSnapLock(true)
      addImage({
        user: {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          id
        },
        content: result.uri+' '+key,
        createdAt: moment().toISOString(),
        isImage: true
      })
      //Presigned URL to be downloaded
      try {
        const sentMessage = await API.graphql(graphqlOperation(createMessage, {
          input: {
            content: key,
            userID: id,
            chatRoomID,
            isImage: true
          }
        }))
        updateChatRoomLastMessage(sentMessage.data.createMessage.id)
      }
      catch(e) { console.log(e) }
    }
    bottomSheetRef?.current?.close()
  }

  const updateChatRoomLastMessage = async(messageID: string) => {
    try{
      await API.graphql(graphqlOperation(updateChatRoom, {
        input: {
          id: chatRoomID,
          lastMessageID: messageID
        }
      }))
    }
    catch(e) { console.log(e) }
  }

  const uploadImage = (filename, img) => {
    return Storage.put(filename, img, {
      level: 'public',
      contentType: 'image/jpg',
      progressCallback(progress){
        setLoading(progress);
      }
    })
    .then((response) => {
      return response.key;
    })
    .catch((error) => {
      console.log(error);
      return error.response;
    });
  };

  const setLoading = (progress) => {
    const calculated = parseInt((progress.loaded / progress.total) * 100);
    setPercentage(calculated);
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const downloadImage = (uri) => {
    Storage.get(uri)
      .then() //ML part to be added
      .catch((err) => console.log(err));
  };

  return(
    <View>
      {percentage > -1 ?
        <View style={styles.loadingContainer}>
          <ActivityIndicator color='black' size='large' />
          <Text style={styles.progress}>Sending Image</Text>
          <Text style={[styles.progress,{marginTop: 5}]}>{percentage+' %'}</Text>
        </View>
      :
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            <Pressable onPress={takePhoto}>
              <Fontisto name="camera" size={36} color="black" style={styles.image}/>
            </Pressable>
            <Text style={styles.text}>Click a photo</Text>
          </View>
          <View style={styles.innerContainer}>
            <Pressable onPress={pickImage} >
              <Ionicons name="images" size={40} color="black" style={styles.image}/>
            </Pressable>
            <Text style={styles.text}>Open gallery</Text>
          </View>
        </View>
      }
    </View>
  )
}

export default ImageSelect
