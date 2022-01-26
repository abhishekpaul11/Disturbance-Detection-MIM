const tintColorLight = '#8E44AD';
const tintColorLightFaded = '#e3bbf0'
const tintColorLightImportant = '#e3bbf080'
const tintColorDarkMessages = '#6C3483'
const tintColorDarkName = '#BB8FCE'
const tintColorDarkTabs = '#A569BD'

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tintFaded: tintColorLightFaded,
    tabs: '#fff',
    rippleColor: '#ccc',
    important: tintColorLightImportant,
    separator: '#ccc',
    msgBorder: tintColorLight,
    keypad: 'white',
    name: tintColorLight,
    contactBackground: '#cccccccc'
  },
  dark: {
    text: '#fff',
    background: '#131c20',
    tint: '#2a2f32',
    tintFaded: tintColorDarkMessages,
    tabs: tintColorDarkTabs,
    rippleColor: '#cccccc42',
    important: '#cccccc45',
    separator: 'grey',
    msgBorder: '#D0D3D4',
    keypad: '#424949',
    name: tintColorDarkName,
    contactBackground: '#33393d'
  },
};
