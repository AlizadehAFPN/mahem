import axiosInstance from './axios-config';
import store from '../stateManager';

// images[0] is the logo, images[1] the banner/main image — see createStore's
// `images: [data.logo, data.image]` below.
function mapStore(item: any) {
  return {
    ...item,
    title: item.name,
    logo: item.images?.[0] && {path: item.images[0]},
    image: item.images?.[1] && {path: item.images[1]},
  };
}

// Known/mapped fields: title -> name, logo/image -> images[]. cityId falls
// back to the current user's city.
export const createStore = (data: {
  logo?: string;
  image?: string;
  title: string;
  category_id?: string;
}) => {
  return axiosInstance
    .post('/stores', {
      name: data.title,
      images: [data.logo, data.image].filter(Boolean),
      categoryId: data.category_id,
      cityId: store.getState().user.cityId,
    })
    .then(res => ({data: mapStore(res.data)}));
};

export const updateStore = (
  id: string,
  data: {logo?: string; image?: string; title?: string; category_id?: string},
) => {
  const images = [data.logo, data.image].filter(Boolean);
  return axiosInstance
    .patch(`/stores/${id}`, {
      ...(data.title !== undefined ? {name: data.title} : {}),
      ...(images.length > 0 ? {images} : {}),
      ...(data.category_id !== undefined ? {categoryId: data.category_id} : {}),
    })
    .then(res => ({data: mapStore(res.data)}));
};

export const deleteStore = (id: string) => {
  return axiosInstance.delete(`/stores/${id}`);
};

export const getAllStore = () => {
  return axiosInstance.get('/stores').then(res => ({
    data: {stores: res.data.items.map(mapStore)},
  }));
};

// Existing callers read `.data` as a plain array (unlike getAllStore, which
// nests it under `.stores`) — preserved as-is per the current usage.
export const getMyStore = () => {
  return axiosInstance
    .get('/stores/mine')
    .then(res => ({data: res.data.items.map(mapStore)}));
};
