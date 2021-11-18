import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, Pressable, ActivityIndicator, Clipboard } from "react-native";
import Autolink from 'react-native-autolink';
import moment from "moment";
import styles from "./styles";
import { API, graphqlOperation } from "aws-amplify";
import { updateUser } from "../../src/graphql/mutations";
import { useNavigation } from "@react-navigation/native";
import { Storage } from "aws-amplify";
import MyLinkPreview from "../MyLinkPreview/index";
import { LinkPreview } from '@flyerhq/react-native-link-preview'
import Toast from 'react-native-root-toast';
import { workmode, isImportant, ImportantMessages } from "../../atoms/WorkMode";
import { useRecoilState } from "recoil";

export type ChatMessageProps = {
  message: Message
  id: String
}

const ChatMessage = (props: ChatMessageProps) => {
  const { message, id, bottomSheetRef, impName } = props
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
  const [workMode] = useRecoilState(workmode)
  const [isImp] = useRecoilState(isImportant)
  const isOpen = useRef(true)
  const [impMsgs, setImpMsgs] = useRecoilState(ImportantMessages)
  const [msgImp, setMsgImp] = useState(impMsgs.includes(message.id))

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

  const handleMsg = async(message) => {
    if(!message.isImage){
      if (!(workMode && !isImp && !msgImp && message.isSpam)){
        Clipboard.setString(message.content)
        Toast.show('Message copied to Clipboard',{
          duration: 1000,
          position: 100,
          shadow: true,
          animation: true,
          backgroundColor: '#ffffff',
          textColor: 'black',
          shadowColor: 'black',
          opacity: 0.9
        })
      }
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
    return () => {
      isOpen.current = false
    }
  },[])

  const displayImage = () => {
    setLoading(false)
    setImgBackground('black')
  }

  const renderImage = (uri) => {
    Image.getSize(uri, (width, height) => {
      if(isOpen.current){
        setImgWidth(height >= width ? '66%' : '74%')
        setAspectRatio(width/height)
      }
    });
  }

  const toggleImportant = async(prevState) => {
    if (!(workMode && !isImp && !msgImp && message.isSpam)){
      setOpacity(0.5)
      if(!impName){
        setTimeout(() => {
          setMsgImp(!msgImp)
          setOpacity(1)
        }, 500)
      }
      const keyword = prevState ? 'Unimportant' : 'Important'
      Toast.show('Message marked as '+keyword,{
        duration: 1000,
        position: 100,
        shadow: true,
        animation: true,
        backgroundColor: '#ffffff',
        textColor: 'black',
        shadowColor: 'black',
        opacity: 0.9
      })
      const newImpMsgs = !prevState ? [...impMsgs, message.id] : impMsgs.filter((msg) => msg !== message.id)
      setImpMsgs(newImpMsgs)
      await API.graphql(graphqlOperation(updateUser, {
        input: {
          id,
          impMessages: newImpMsgs
        }
      }))
    }
  }

  return (
    <View style = {styles.container}>
      <View opacity={opacity} width={message.isImage ? imgWidth : textWidth} style = {
        [styles.messageBox,{
          backgroundColor: isMyMessage() ? '#e3bbf0' : 'white',
          marginRight: isMyMessage() ? 5 : 50,
          marginLeft: isMyMessage() ? 50 : 5,
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
          padding: message.isImage ? 5 : textPadding,
          borderWidth: msgImp ? 2 : 0,
          borderColor: '#75228f'
        }]}>
        <Pressable onPress={() => handleMsg(message)} onLongPress={() => toggleImportant(msgImp)}>
          {impName && !isMyMessage() && <Text style={message.isImage ? [styles.name,{marginLeft: 5}] : styles.name}>{message.user.name}</Text>}
          {workMode && !isImp && !msgImp && message.isSpam ?
            <Text style={[styles.message,{fontStyle: 'italic', color: '#696969'}]}>{'This message has been flagged as Spam'}</Text>
          :
            <View>
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
              </View>}
          <Text style = {[styles.time, { paddingRight: textPadding==5 ? 5 : 0}]}>{timestamp()}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ChatMessage
