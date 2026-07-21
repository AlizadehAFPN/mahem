import axiosInstance from './axios-config';

export const getOrCreateConversation = (advertisementId: string) => {
  return axiosInstance
    .post('/chat/conversations', {advertisementId})
    .then(res => res.data);
};

export const getConversations = () => {
  return axiosInstance.get('/chat/conversations').then(res => res.data);
};

export const getMessages = (conversationId: string, query?: any) => {
  return axiosInstance
    .get(`/chat/conversations/${conversationId}/messages`, {params: query})
    .then(res => res.data);
};

export const markConversationRead = (conversationId: string) => {
  return axiosInstance.patch(`/chat/conversations/${conversationId}/read`);
};
