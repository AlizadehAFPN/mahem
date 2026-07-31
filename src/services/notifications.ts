import axiosInstance from './axios-config';
import {normalizeListQuery} from './normalize-query';

export const getNotifications = (query?: any) => {
  return axiosInstance
    .get('/notifications/me', {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        notifications: res.data.items,
        unreadCount: res.data.unreadCount,
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};

export const markNotificationRead = (id: string) => {
  return axiosInstance.patch(`/notifications/me/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return axiosInstance.patch('/notifications/me/read-all');
};

export const deleteNotification = (id: string) => {
  return axiosInstance.delete(`/notifications/me/${id}`);
};
