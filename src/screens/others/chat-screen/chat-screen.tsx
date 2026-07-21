import {FlatList, View} from 'react-native';
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
import {useQuery} from 'react-query';
import {
  getMessages,
  getOrCreateConversation,
  markConversationRead,
} from '../../../services';
import {getSocket} from '../../../services/socket';

export function ChatScreen() {
  const insents = useSafeAreaInsets();
  const {params} = useRoute();
  const user = useSelector(s => s.user);
  const [conversationId, setConversationId] = useState(params?.conversationId);
  const [messages, setMessages] = useState<any[]>([]);

  // A brand-new thread (opened from an ad's detail screen) needs
  // get-or-create first; opened from the conversation list, the id is
  // already known.
  const {data: conversation} = useQuery(
    ['conversation', params?.advertisementId],
    () => getOrCreateConversation(params?.advertisementId),
    {enabled: !conversationId && !!params?.advertisementId},
  );

  useEffect(() => {
    if (conversation?.id) {
      setConversationId(conversation.id);
    }
  }, [conversation]);

  useQuery(['messages', conversationId], () => getMessages(conversationId), {
    enabled: !!conversationId,
    onSuccess: data => setMessages(data.items ?? []),
  });

  useEffect(() => {
    if (!conversationId) {
      return;
    }
    markConversationRead(conversationId).catch(() => {});

    const socket = getSocket();
    if (!socket) {
      return;
    }
    socket.emit('conversation:join', {conversationId});

    const onMessageNew = (message: any) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      setMessages(prev => [...prev, message]);
    };
    socket.on('message:new', onMessageNew);
    return () => {
      socket.off('message:new', onMessageNew);
    };
  }, [conversationId]);

  const onPressButton = (text: string) => {
    if (!text.trim() || !conversationId) {
      return;
    }
    const socket = getSocket();
    socket?.emit('message:send', {conversationId, text});
  };

  const mappedMessages = messages.map(message => ({
    ...message,
    me: message.senderId === user?.id,
  }));

  return (
    <Screen withoutScroll style={{paddingBottom: insents.bottom}}>
      <ChatHeader title={params?.title} />
      <View style={{flex: 1}}>
        <FlatList
          data={mappedMessages}
          keyExtractor={(item, index) => item.id ?? String(index)}
          ItemSeparatorComponent={<Divider height={10} />}
          renderItem={({item, index}) => (
            <Message
              key={item.id ?? String(index)}
              message={item}
              index={index}
            />
          )}
        />
      </View>
      <MessageSender onPressButton={onPressButton} />
    </Screen>
  );
}
