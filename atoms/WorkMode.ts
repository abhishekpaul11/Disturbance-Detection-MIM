import { atom } from "recoil";

export const workmode = atom({
  key: 'workmode',
  default: undefined
})

export const isImportant = atom({
  key: 'isImportant',
  default: false
})

export const StarLock = atom({
  key: 'StarLock',
  default: true
})

export const Refresh = atom({
  key: 'Refresh',
  default: false
})

export const ImportantChats = atom({
  key: 'ImportantChats',
  default: ['empty']
})

export const UnimportantChats = atom({
  key: 'UnimportantChats',
  default: []
})
