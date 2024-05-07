import {StyleSheet, Text, View, FlatList, Platform} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  ChatHeader,
  Divider,
  Message,
  MessageSender,
  Screen,
} from '../../../components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import database from '@react-native-firebase/database';

export function ChatScreen() {
  const insents = useSafeAreaInsets();
  const {params} = useRoute();
  const [message, setMessage] = useState([]);
  const [total, setTotal] = useState([]);
  const user = useSelector(s => s.user);
  //   console.log(params, 'rrrr');
  useEffect(() => {
    database()
      .ref()
      .on('value', snapshot => {
        if (!snapshot.val()) setMessage([]);
        else {
          setTotal(snapshot.val());
          let temp = snapshot.val();
          temp = temp?.filter(item => item?.id === params?.id);
          if (temp.length > 0) {
            temp = temp.map((object: any) => ({
              ...object,
              me: object?.sender === user?.mobile ? true : false,
            }));
          }
          setMessage(temp);
        }
      });
  }, []);
  console.log(params, Platform?.OS, 'params');

  const onPressButton = (text: string) => {
    const newObj = {
      ...params,
      sender: user?.mobile,
      text,
      id: params?.id,
      receiver: params?.receiver,
      title: params?.title,
    };
    const newArray = [...total, newObj];
    database().ref().set(newArray);
  };

  return (
    <Screen withoutScroll style={{paddingBottom: insents.bottom}}>
      <ChatHeader />
      <View style={{flex: 1}}>
        <FlatList
          data={message}
          keyExtractor={(item, index) => String(index)}
          ItemSeparatorComponent={<Divider height={10} />}
          renderItem={({item, index}) => (
            <Message key={String(index + 190)} message={item} index={index} />
          )}
        />
      </View>
      <MessageSender onPressButton={onPressButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({});
