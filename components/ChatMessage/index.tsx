import React, { useEffect, useState } from "react";
import { Text, View, Image, Pressable, ActivityIndicator, Clipboard } from "react-native";
import Autolink from 'react-native-autolink';
import moment from "moment";
import styles from "./styles";
import { API, graphqlOperation } from "aws-amplify";
import { deleteMessage } from "../../src/graphql/mutations";
import { useNavigation } from "@react-navigation/native";
import { Storage } from "aws-amplify";
import MyLinkPreview from "../MyLinkPreview/index";
import { LinkPreview } from '@flyerhq/react-native-link-preview'
import Toast from 'react-native-root-toast';

export type ChatMessageProps = {
  message: Message
  id: String
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message, id, bottomSheetRef } = props
  const [uri, setUri] = useState('toBeFetched')
  const [loading, setLoading] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [key, setKey] = useState('')
  const navigation = useNavigation()
  const [linkData, setLinkData] = useState(null)
  const [imgWidth, setImgWidth] = useState('66%')
  const [aspectRatio, setAspectRatio] = useState(1)
  const [imgBackground, setImgBackground] = useState('transparent')
  const [textWidth, setTextWidth] = useState('auto')
  const [textPadding, setTextPadding] = useState(10)

  const isMyMessage = () => {
    return message.user.id === id
  }

  const timestamp = () => {
    const diff = moment().diff(message.createdAt, 'days')
    if(diff > 1) return moment(message.createdAt).format('Do MMM \'YY h:mm a');
    const ts = moment(message.createdAt).fromNow()
    if(['in a few seconds', 'a few seconds ago'].includes(ts)) return 'just now'
    return ts
  }

  const openImage = async(message) => {
    if(!message.isImage){
      await API.graphql(graphqlOperation(deleteMessage,{
         input: {
           id: message.id
         }
      }))
    }
    else if(!loading){
      bottomSheetRef?.current?.close()
      navigation.navigate('ImageFullScreen', {img: uri, key, name: isMyMessage() ? 'You' : message.user.name, timestamp: timestamp()})
    }
  }

  useEffect(() => {
    if(message.isImage){
      if(message.content.startsWith('file')){
        setUri(message.content.split(' ')[0])
        setKey(message.content.split(' ')[1])
        renderImage(message.content.split(' ')[0])
      }
      else {
        const fetchImage = (async() => {
          const url = await Storage.get(message.content)
          setUri(url)
          renderImage(url)
        })()
      }
    }
  },[])

  const displayImage = () => {
    setLoading(false)
    setImgBackground('black')
  }

  const renderImage = (uri) => {
    Image.getSize(uri, (width, height) => {
      setImgWidth(height >= width ? '66%' : '74%')
      setAspectRatio(width/height)
    });
  }

  return (
    <View style = {styles.container}>
      <View opacity={opacity} width={message.isImage ? imgWidth : textWidth} style = {
        [styles.messageBox,{
          backgroundColor: isMyMessage() ? '#e3bbf0' : 'white',
          marginRight: isMyMessage() ? 5 : 50,
          marginLeft: isMyMessage() ? 50 : 5,
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
          padding: message.isImage ? 5 : textPadding
        }]}>
        <Pressable onPress={() => openImage(message)} onLongPress={() => setOpacity(0.5)} onPressOut={() => setOpacity(1)}>
          {false && <Text style={message.isImage ? [styles.name,{marginLeft: 5}] : styles.name}>{message.user.name}</Text>}
          {message.isImage ?
            <View>
              {loading && <ActivityIndicator style={styles.activityIndicator} color={'#75228f'} size={'large'}/>}
              <Image source={{uri: uri}} onLoadEnd={displayImage} style={styles.image} backgroundColor={imgBackground} aspectRatio={aspectRatio} resizeMode='cover'/>
            </View>
          :
            <View>
              <LinkPreview text={message.content}
                           containerStyle = {{display: 'none'}}
                           onPreviewDataFetched	= {setLinkData}
              />
              {(linkData?.title || linkData?.description || linkData?.image) && <MyLinkPreview linkData = {linkData} setTextPadding={setTextPadding} setTextWidth={setTextWidth} isMyMessage={isMyMessage}/>}
              <Autolink text = {message.content}
                        style = {[styles.message, { paddingTop: textPadding==5 ? 5 : 0, paddingHorizontal: textPadding==5 ? 5 : 0}]}
                        hashtag = 'instagram'
                        mention = 'twitter'
                        phone = 'true'
                        onLongPress = {(url) => {Clipboard.setString(url); Toast.show('Link copied to Clipboard',{
                          duration: 1000,
                          position: 100,
                          shadow: true,
                          animation: true,
                          backgroundColor: '#ffffff',
                          textColor: 'black',
                          shadowColor: 'black',
                          opacity: 0.9
                        })}}
              />
            </View>}
          <Text style = {[styles.time, { paddingRight: textPadding==5 ? 5 : 0}]}>{timestamp()}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ChatMessage
