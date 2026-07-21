import axiosInstance from './axios-config';
import {mapAdvertisement} from './ads';

// GET /users/me/bookmarks returns [{ id, advertisementId, advertisement, ... }];
// flatten to the same mapped-advertisement shape single-product/RowProduct expect.
export const getBookmarks = () => {
  return axiosInstance.get('/users/me/bookmarks').then(res => ({
    data: res.data.map((bookmark: any) =>
      mapAdvertisement(bookmark.advertisement),
    ),
  }));
};

export const addBookmark = (advertisementId: string) => {
  return axiosInstance.post(`/users/me/bookmarks/${advertisementId}`);
};

export const removeBookmark = (advertisementId: string) => {
  return axiosInstance.delete(`/users/me/bookmarks/${advertisementId}`);
};
