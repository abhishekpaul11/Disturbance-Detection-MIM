import React, { useEffect, useState, useRef } from "react";
import { Text, View, Image, Pressable, ActivityIndicator, Clipboard, Dimensions } from "react-native";
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
import { workmode, isImportant, ImportantMessages, SentMessages, ImpLock } from "../../atoms/WorkMode";
import { useRecoilState } from "recoil";
import SpamMessage from "../SpamMessage";
import Colors from "../../constants/Colors";
import useColorScheme from '../../hooks/useColorScheme';

export type ChatMessageProps = {
  message: Message
  id: String
}

const ChatMessage = (props: ChatMessageProps) => {
  const colorScheme = useColorScheme()
  const windowHeight = Dimensions.get('window').height;
  const { message, id, bottomSheetRef, removeMsg, toggleImpMsgs } = props
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
  const [sentMsgs] = useRecoilState(SentMessages)
  const [impLock, setImpLock] = useRecoilState(ImpLock)
  const [visible, setVisible] = useState(false)
  const [maxHeight, setMaxHeight] = useState(350/823 * windowHeight)

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

  const displayToast = (message) => {
    Toast.show(message,{
      duration: 1000,
      position: 100,
      shadow: true,
      animation: true,
      backgroundColor: colorScheme == 'light' ? '#ffffff' : '#4D5656',
      textColor: Colors[colorScheme].text,
      shadowColor: colorScheme == 'light' ? 'black' : '#d0d3d4',
      opacity: 0.95
    })
  }

  const handleMsg = async(message) => {
    if(!message.isImage){
      if (!(workMode && !isImp && !msgImp && message.isSpam)){
        Clipboard.setString(message.content)
        displayToast('Message copied to Clipboard')
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

  useEffect(() => {
    message.id = message.id == undefined ? sentMsgs[message.index] : message.id
  },[sentMsgs])

  const toggleImportant = (prevState) => {
    if(!message.isImage || !loading){
      setImpLock(true)
      setOpacity(0.5)
      message.id == undefined ? displayToast('Please Wait') : ''
      message.index != undefined ? getID(prevState) : toggleHelper(prevState)
    }
  }

  const getID = (prevState) => {
    if(message.id != undefined){
      toggleImpMsgs(message.id, prevState)
      setTimeout(() => {
        setMsgImp(!msgImp)
        setMaxHeight(prevState ? 350/823 * windowHeight - 0.1: 350/823 * windowHeight + 0.1)
        setOpacity(1)
        const keyword = prevState ? 'Unimportant' : 'Important'
        displayToast('Message marked as '+keyword)
        setImpLock(false)
      }, 500)
    }
    else {
      setTimeout(() => {
        getID(prevState)
      }, 500);
    }
  }

  const toggleHelper = async(prevState) => {
    if(!removeMsg){
      setTimeout(() => {
        setMsgImp(!msgImp)
        setMaxHeight(prevState ? 350/823 * windowHeight - 0.1 : 350/823 * windowHeight + 0.1)
        setOpacity(1)
        const keyword = prevState ? 'Unimportant' : 'Important'
        displayToast('Message marked as '+keyword)
      }, 500)
    }
    else{
      removeMsg(message.id)
      setTimeout(() => {
        displayToast('Message marked as Unimportant')
      }, 500);
    }
    setImpLock(false)
    const newImpMsgs = !prevState ? [...impMsgs, message.id] : impMsgs.filter((msg) => msg !== message.id)
    setImpMsgs(newImpMsgs)
    await API.graphql(graphqlOperation(updateUser, {
      input: {
        id,
        impMessages: newImpMsgs
      }
    }))
  }

  const show = () => {
    if(!visible){
      setVisible(true)
      displayToast('Message Unmasked Temporarily')
      setTimeout(() => {
        setVisible(false)
      }, 5000);
    }
  }

  if(workMode && !isImp && !msgImp && message.isSpam && !visible){
    return(
      <Pressable onLongPress={show}>
        <SpamMessage isMyMessage={isMyMessage} timestamp={timestamp} name={message.user.name}/>
      </Pressable>
    )
  }

  return (
    <View style = {styles.container}>
      <View opacity={opacity} width={message.isImage ? imgWidth : textWidth} style = {
        [styles.messageBox,{
          backgroundColor: isMyMessage() ? Colors[colorScheme].tintFaded : colorScheme == 'light' ? 'white' : '#424949',
          marginRight: isMyMessage() ? 5 : 50,
          marginLeft: isMyMessage() ? 50 : 5,
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
          padding: message.isImage ? 5 : textPadding,
          borderWidth: msgImp ? 2 : 0,
          borderColor: Colors[colorScheme].msgBorder
        }]}>
        <Pressable onPress={() => handleMsg(message)} onLongPress={() => toggleImportant(msgImp)}>
          {removeMsg && !isMyMessage() && <Text style={message.isImage ? [styles.name,{marginLeft: 5, color: Colors[colorScheme].name}] : [styles.name,{color: Colors[colorScheme].name}]}>{message.user.name}</Text>}
          <View>
            {message.isImage ?
              <View>
                {loading && <ActivityIndicator style={styles.activityIndicator} color={Colors[colorScheme].msgBorder} size={'large'}/>}
                <Image source={{uri: uri}} onLoadEnd={displayImage} style={styles.image} backgroundColor={imgBackground} aspectRatio={aspectRatio} resizeMode='cover' maxHeight={maxHeight} />
              </View>
            :
              <View>
                <LinkPreview text={message.content}
                             containerStyle = {{display: 'none'}}
                             onPreviewDataFetched	= {setLinkData}
                />
                {(linkData?.title || linkData?.description || linkData?.image) && <MyLinkPreview linkData = {linkData} setTextPadding={setTextPadding} setTextWidth={setTextWidth} isMyMessage={isMyMessage} imp={msgImp} toggleImportant={toggleImportant}/>}
                <Autolink text = {message.content}
                          style = {[styles.message, { paddingTop: textPadding==5 ? 5 : 0, paddingHorizontal: textPadding==5 ? 5 : 0, color: Colors[colorScheme].text}]}
                          hashtag = 'instagram'
                          mention = 'twitter'
                          phone = 'true'
                          onLongPress = {(url) => {Clipboard.setString(url); displayToast('Link copied to Clipboard')}}
                />
              </View>}
          </View>
          <Text style = {[styles.time, { paddingRight: textPadding==5 ? 5 : 0, color: colorScheme == 'light' ? 'grey' : '#D0D3D4'}]}>{timestamp()}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ChatMessage
