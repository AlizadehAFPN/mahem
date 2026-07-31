import axiosInstance from './axios-config';

export const getOrCreateConversation = (advertisementId: string) => {
  return axiosInstance
    .post('/chat/conversations', {advertisementId})
    .then(res => res.data);
};

export const getConversations = () => {
  return axiosInstance.get('/chat/conversations').then(res => res.data);
};

// A thread opened by id alone (a chat notification tap) still needs the ad
// title and the counterparty for the header — getOrCreateConversation can't
// help there, it keys on an advertisement id.
export const getConversation = (conversationId: string) => {
  return axiosInstance
    .get(`/chat/conversations/${conversationId}`)
    .then(res => res.data);
};

export const getMessages = (conversationId: string, query?: any) => {
  return axiosInstance
    .get(`/chat/conversations/${conversationId}/messages`, {params: query})
    .then(res => res.data);
};

export const markConversationRead = (conversationId: string) => {
  return axiosInstance.patch(`/chat/conversations/${conversationId}/read`);
};
