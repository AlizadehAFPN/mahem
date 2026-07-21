import axiosInstance from './axios-config';
import store from '../stateManager';
import {normalizeListQuery} from './normalize-query';

// Builds the { title, sub_categories: [...] } tree the category picker
// expects, from the new backend's flat list of { id, name, parentId }.
function buildCategoryTree(flat: any[], parentId: string | null = null): any[] {
  return flat
    .filter(category => category.parentId === parentId)
    .map(category => ({
      ...category,
      title: category.name,
      sub_categories: buildCategoryTree(flat, category.id),
    }));
}

export const getAdsCategories = () => {
  return axiosInstance
    .get('/categories', {params: {type: 'GENERAL'}})
    .then(res => ({
      data: buildCategoryTree(res.data),
    }));
};

// Maps a new-backend advertisement into the old flat shape the ad-detail
// screens read: nested `category_id`/`city` objects with `.title`, plus
// synthesized `image1..imageN` keys (the old backend stored numbered image
// references; the new one stores a plain `images: string[]`).
export function mapAdvertisement(ad: any) {
  const imageFields: Record<string, {path: string}> = {};
  (ad.images || []).forEach((url: string, index: number) => {
    imageFields[`image${index + 1}`] = {path: url};
  });

  return {
    ...ad,
    ...ad.attributes,
    ...imageFields,
    contact_info: ad.contactInfo,
    category_id: ad.category && {...ad.category, title: ad.category.name},
    city: ad.city && {...ad.city, title: ad.city.name},
  };
}

// Known/mapped fields: title, description, price, contact_info (as
// contactInfo), categoryId (from category_id), cityId (falls back to the
// current user's city), lat/lng (from the map location picker). Everything
// else CarForm/EstateForm collect (brand, product_year, area, floor,
// elevator, parking, etc.) is category-specific and has no dedicated
// column, so it's nested under `attributes` (a flexible JSON field) instead
// of being silently stripped by the backend's request whitelist.
export const createAds = (data: any) => {
  const {
    category_id,
    city_id,
    title,
    description,
    price,
    contact_info,
    lat,
    lng,
    ...rest
  } = data;
  const images: string[] = [];
  const attributes: Record<string, unknown> = {};

  Object.entries(rest).forEach(([key, value]) => {
    const imageMatch = key.match(/^image_(\d+)$/);
    if (imageMatch) {
      images[Number(imageMatch[1]) - 1] = value as string;
    } else if (value !== undefined && value !== '') {
      attributes[key] = value;
    }
  });

  return axiosInstance
    .post('/advertisements', {
      title,
      description,
      price: price !== undefined && price !== '' ? Number(price) : undefined,
      contactInfo: contact_info,
      categoryId: category_id,
      cityId: city_id ?? store.getState().user.cityId,
      images: images.filter(Boolean),
      ...(lat !== undefined && lat !== '' ? {lat: Number(lat)} : {}),
      ...(lng !== undefined && lng !== '' ? {lng: Number(lng)} : {}),
      ...(Object.keys(attributes).length > 0 ? {attributes} : {}),
    })
    .then(res => ({data: mapAdvertisement(res.data)}));
};

export const getAds = (query: any) => {
  return axiosInstance
    .get('/advertisements', {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        ads: res.data.items.map(mapAdvertisement),
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};

export const getSingleAds = (id: string) => {
  return axiosInstance
    .get(`/advertisements/${id}`)
    .then(res => ({data: mapAdvertisement(res.data)}));
};

export const getMyAds = (query?: any) => {
  return axiosInstance
    .get('/advertisements/mine', {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        ads: res.data.items.map(mapAdvertisement),
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};

// Same field-splitting as createAds (category-specific fields fall through
// into `attributes`), but every field is optional since this is a partial
// update — omitted fields are left untouched server-side.
export const updateAds = (id: string, data: any) => {
  const {
    category_id,
    city_id,
    title,
    description,
    price,
    contact_info,
    lat,
    lng,
    ...rest
  } = data;
  const images: string[] = [];
  const attributes: Record<string, unknown> = {};

  Object.entries(rest).forEach(([key, value]) => {
    const imageMatch = key.match(/^image_(\d+)$/);
    if (imageMatch) {
      images[Number(imageMatch[1]) - 1] = value as string;
    } else if (value !== undefined && value !== '') {
      attributes[key] = value;
    }
  });

  return axiosInstance
    .patch(`/advertisements/${id}`, {
      ...(title !== undefined ? {title} : {}),
      ...(description !== undefined ? {description} : {}),
      ...(price !== undefined && price !== '' ? {price: Number(price)} : {}),
      ...(contact_info !== undefined ? {contactInfo: contact_info} : {}),
      ...(category_id !== undefined ? {categoryId: category_id} : {}),
      ...(city_id !== undefined ? {cityId: city_id} : {}),
      ...(lat !== undefined && lat !== '' ? {lat: Number(lat)} : {}),
      ...(lng !== undefined && lng !== '' ? {lng: Number(lng)} : {}),
      ...(images.filter(Boolean).length > 0
        ? {images: images.filter(Boolean)}
        : {}),
      ...(Object.keys(attributes).length > 0 ? {attributes} : {}),
    })
    .then(res => ({data: mapAdvertisement(res.data)}));
};

export const deleteAds = (id: string) => {
  return axiosInstance.delete(`/advertisements/${id}`);
};
