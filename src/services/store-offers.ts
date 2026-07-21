import axiosInstance from './axios-config';
import {normalizeListQuery} from './normalize-query';

function mapStoreOffer(item: any) {
  return {
    ...item,
    image1: item.images?.[0] && {path: item.images[0]},
  };
}

export const createStoreOffer = (storeId: string, data: any) => {
  const images: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    const imageMatch = key.match(/^image_(\d+)$/);
    if (imageMatch) {
      images[Number(imageMatch[1]) - 1] = value as string;
    }
  });

  return axiosInstance
    .post(`/stores/${storeId}/offers`, {
      title: data.title,
      description: data.description,
      discountPercent:
        data.discountPercent !== undefined && data.discountPercent !== ''
          ? Number(data.discountPercent)
          : undefined,
      originalPrice:
        data.originalPrice !== undefined && data.originalPrice !== ''
          ? Number(data.originalPrice)
          : undefined,
      images: images.filter(Boolean),
      contactInfo: data.contactInfo,
      expiresAt: data.expiresAt,
      cityId: data.cityId,
    })
    .then(res => ({data: mapStoreOffer(res.data)}));
};

export const getStoreOffers = (storeId: string, query?: any) => {
  return axiosInstance
    .get(`/stores/${storeId}/offers`, {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        offers: res.data.items.map(mapStoreOffer),
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};
