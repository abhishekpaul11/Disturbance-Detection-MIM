import React, { useEffect } from "react";
import { View, Text, Image, Dimensions, Linking } from "react-native";
import { TouchableRipple } from "react-native-paper";
import styles from "./styles";

const MyLinkPreview = (props) => {
  const { linkData, setTextWidth, isMyMessage, setTextPadding } = props
  const windowWidth = Dimensions.get('window').width;
  linkData.description = linkData.description ? linkData.description : 'Link preview'
  linkData.title = linkData.title ? linkData.title : 'Click here to visit the link.'

  useEffect(() => {
    if(linkData.image && !isMinImage()){
      setTextWidth(isVerticalImage() ? 270/412 * windowWidth : 300/412 * windowWidth)
    }
    setTextPadding(5)
  },[])

  const isMinImage = () => {
    return linkData.image.height === linkData.image.width
  }

  const getAspectRatio = () => {
    return linkData.image.width / linkData.image.height
  }

  const isVerticalImage = () => {
    return linkData.image.height > linkData.image.width
  }

  const getTextBoxWidth = () => {
    if(linkData.image){
      if(!isMinImage()){
        return isVerticalImage() ? 260/412 * windowWidth : 290/412 * windowWidth
      }
      return 260/412 * windowWidth
    }
    return undefined
  }

  return (
    <TouchableRipple onPress={() => Linking.openURL(linkData.link)} rippleColor={'#cccccc42'} style={styles.container}>
      <View>
        {linkData.image && !isMinImage() && <Image
                source={{uri: linkData.image.url}}
                aspectRatio={isVerticalImage() ? undefined : getAspectRatio()}
                style={[styles.maxImage, {borderWidth: isMyMessage() ? 0 : 0.5, width: isVerticalImage() ? 260/412 * windowWidth : 290/412 * windowWidth, height: isVerticalImage() ? 290/412 * windowWidth : undefined}]}/>}
        <View style={[styles.lowerContainer, {height: linkData.image ? isMinImage() ? 80 : undefined : 80}]}>
          {linkData.image && isMinImage() && <Image
                source={{uri: linkData.image.url}}
                style={[styles.minImage, { borderWidth: isMyMessage() ? 0 : 0.5} ]}/>}
          <View style={[styles.textContainer, {width: getTextBoxWidth(),
            minWidth: linkData.image ? undefined : 260/412 * windowWidth,
            maxWidth: linkData.image ? undefined : 340/412 * windowWidth}]}>
            {linkData.title && <Text numberOfLines = {1} ellipsizeMode={'tail'} style={styles.title}>{linkData.title}</Text>}
            {linkData.description && <Text numberOfLines = {3} ellipsizeMode={'tail'} style={styles.description}>{linkData.description}</Text>}
          </View>
        </View>
      </View>
    </TouchableRipple>
  )
}

export default MyLinkPreview
