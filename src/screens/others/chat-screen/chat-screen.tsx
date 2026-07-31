import {Alert, FlatList, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ChatHeader,
  Divider,
  ImageViewerModal,
  Message,
  MessageSender,
  Screen,
} from '../../../components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {
  getConversation,
  getMessages,
  getOrCreateConversation,
  markConversationRead,
  upload,
} from '../../../services';
import {getSocket} from '../../../services/socket';
import {RootState} from '../../../stateManager';
import {useMissingEntityGuard} from '../../../hooks/use-missing-entity-guard';
import {
  isSupportedImageType,
  UNSUPPORTED_IMAGE_TYPE_MESSAGE,
} from '../../../utiles/utiles_funcs';

export function ChatScreen() {
  const insents = useSafeAreaInsets();
  const {t} = useTranslation();
  const {params} = useRoute<any>();
  const user = useSelector((s: RootState) => s.user);
  const [conversationId, setConversationId] = useState(params?.conversationId);
  const [messages, setMessages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

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

  // Opened by conversation id alone (tapping a chat message in پیام‌ها), so
  // the header's ad title and counterparty avatar weren't passed down —
  // resolve them from the thread itself. Skipped for the ChatItem/ad-detail
  // entry points, which already have both.
  const needsThreadDetails = !!conversationId && !params?.title;
  // Deleting an advertisement cascades its conversations away, so a chat
  // notification can outlive the thread it points at. One shared guard between
  // both queries below — two instances would stack two alerts for one thread.
  const missingThreadGuard = useMissingEntityGuard('chat.threadDeleted');
  const {data: threadDetails} = useQuery(
    ['conversationDetails', conversationId],
    () => getConversation(conversationId),
    {enabled: needsThreadDetails, ...missingThreadGuard},
  );
  const counterparty =
    threadDetails &&
    (threadDetails.buyerId === user?.id
      ? threadDetails.seller
      : threadDetails.buyer);
  const title = params?.title ?? threadDetails?.advertisement?.title;
  const counterpartyAvatar = params?.avatar ?? counterparty?.avatar;

  useQuery(['messages', conversationId], () => getMessages(conversationId), {
    enabled: !!conversationId,
    onSuccess: data => setMessages(data.items ?? []),
    ...missingThreadGuard,
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

  // The attach button sends exactly one image per message and no caption, so
  // the picked photo goes straight out: upload it over REST (the socket carries
  // JSON, not file bytes), then send the resulting URL as the message. The
  // message itself arrives back through the `message:new` listener above, the
  // same way a text message the user sent does — no optimistic row to reconcile.
  const onSelectImage = async (image: any) => {
    if (!image?.uri || !conversationId || uploadingImage) {
      return;
    }
    if (!isSupportedImageType(image.type)) {
      Alert.alert(
        t('common.imageFormatUnsupported'),
        UNSUPPORTED_IMAGE_TYPE_MESSAGE(),
      );
      return;
    }
    const socket = getSocket();
    if (!socket) {
      Alert.alert(t('common.somethingWrong'), t('chat.imageSendFailed'));
      return;
    }

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('file', {
        // react-native-image-picker usually supplies fileName, but some Android
        // camera captures don't — and the backend takes the stored file's
        // extension from this name, so a nameless upload would end up served
        // without a content type. The mime subtype is a safe stand-in here
        // because isSupportedImageType() has already vetted it.
        name:
          image.fileName || `chat-${Date.now()}.${image.type.split('/')[1]}`,
        type: image.type,
        uri: image.uri,
      } as any);
      const uploaded = await upload(form);
      socket.emit('message:send', {
        conversationId,
        imageUrl: uploaded?.data?.id,
      });
    } catch {
      Alert.alert(t('common.somethingWrong'), t('chat.imageSendFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const mappedMessages = messages.map(message => ({
    ...message,
    me: message.senderId === user?.id,
    avatar: message.senderId === user?.id ? user?.avatar : counterpartyAvatar,
  }));

  return (
    <Screen withoutScroll style={{paddingBottom: insents.bottom}}>
      <ChatHeader title={title} avatar={counterpartyAvatar} />
      <View style={{flex: 1}}>
        <FlatList
          ref={listRef}
          data={mappedMessages}
          keyExtractor={(item, index) => item.id ?? String(index)}
          ItemSeparatorComponent={<Divider height={10} />}
          // Oldest-first list, so anything new lands below the fold — including
          // the image the user just sent, which is the whole point of tapping
          // attach. Images also grow the content after their bubble has already
          // been laid out, hence keying off content size rather than the data.
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({animated: true})
          }
          renderItem={({item, index}) => (
            <Message
              key={item.id ?? String(index)}
              message={item}
              index={index}
              onPressImage={setViewerUri}
            />
          )}
        />
      </View>
      <MessageSender
        onPressButton={onPressButton}
        onSelectImage={onSelectImage}
        uploadingImage={uploadingImage}
      />
      <ImageViewerModal
        visible={!!viewerUri}
        uri={viewerUri}
        onClose={() => setViewerUri(null)}
      />
    </Screen>
  );
}
