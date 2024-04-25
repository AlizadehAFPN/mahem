import {Share} from 'react-native'
export const SocialShare = (
    message = "MESSAGE",
    dialogTitle = "mahem",
    subject = "SUBJECT",
    tintColor = "red",
    title = "TITLE",
    url = "https://google.com"
  ) => Share.share({ message, title }, { dialogTitle, subject, tintColor });