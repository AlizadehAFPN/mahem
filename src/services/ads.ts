import axiosInstance from './axios-config';
import store from '../stateManager';
import {normalizeListQuery} from './normalize-query';
import {upload} from './common';

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

function subtreeContains(node: any, targetId: string): boolean {
  if (node.id === targetId) {
    return true;
  }
  return (node.sub_categories || []).some((child: any) =>
    subtreeContains(child, targetId),
  );
}

// EditAdScreen needs to know which specialized form (CarForm/EstateForm/
// OfferForm/CommonForm) an existing ad belongs to, but an ad is always
// tagged with its most specific (leaf) category, not the top-level one
// CreateAdsScreen branches on — walk the tree to find which top-level
// branch actually contains it.
export function findMainCategory(tree: any[], targetId?: string) {
  if (!targetId) {
    return undefined;
  }
  return tree.find(node => subtreeContains(node, targetId));
}

// Ads are only ever tagged with a leaf category (see Picker's create-flow
// behavior: onSelect only fires once a node with no further children is
// reached), never an intermediate one — so "show everything under این
// دسته" (a category browse stopped at a non-leaf node, or the top of the
// tree) means resolving to every leaf underneath it, not the node's own id.
export function collectLeafCategoryIds(node: any): string[] {
  const children = node?.sub_categories || [];
  if (children.length === 0) {
    return node?.id ? [node.id] : [];
  }
  return children.flatMap((child: any) => collectLeafCategoryIds(child));
}

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
    store: ad.store ?? undefined,
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
    store_id,
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
      ...(store_id ? {storeId: store_id} : {}),
      ...(Object.keys(attributes).length > 0 ? {attributes} : {}),
    })
    .then(res => ({data: mapAdvertisement(res.data)}));
};

// Shared by CreateAdsDetailsScreen (free categories, uploads+creates
// immediately) and CreateAdsPaymentScreen (fee-required categories, defers
// this until "پرداخت" is tapped — see Category.adFeeToman) so the
// image-upload-then-create sequence isn't duplicated between the two.
// `images` is the 5-slot array from AdsImageSelection (each slot either ''
// or a {uri, fileName, type} picker ref); uploads happen one at a time,
// only for slots that were actually filled.
export async function createAdsWithImages(
  images: any[],
  payload: Record<string, any>,
  onUploadingChange?: (indexes: number[]) => void,
) {
  const imageData: Record<string, any> = {};
  const uploadingIndexes: number[] = [];
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    if (image?.uri) {
      uploadingIndexes.push(index);
      onUploadingChange?.([...uploadingIndexes]);
      const form = new FormData();
      form.append('file', {
        name: image.fileName,
        type: image.type,
        uri: image.uri,
      } as any);
      const uploaded = await upload(form);
      imageData[`image_${index + 1}`] = uploaded?.data?.id;
      uploadingIndexes.splice(uploadingIndexes.indexOf(index), 1);
      onUploadingChange?.([...uploadingIndexes]);
    }
  }
  return createAds({...payload, ...imageData});
}

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

// Owner-only "تراز بازدید" stats: lifetime total, a 22-day daily trend, and
// a viewer gender split (see AdvertisementsService.getViewStats).
export interface AdViewStats {
  total: number;
  daily: {date: string; count: number}[];
  genderBreakdown: {male: number; female: number};
}
export const getAdViewStats = (id: string) => {
  return axiosInstance
    .get<AdViewStats>(`/advertisements/${id}/view-stats`)
    .then(res => ({data: res.data}));
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
// update — omitted fields are left untouched server-side. `images` is taken
// as a plain, already-resolved string[] (not the image_N convention
// createAds uses) so the caller can send an explicit `[]` to clear every
// image — omitting the key entirely (undefined) is what leaves images
// untouched, so those two cases have to stay distinguishable.
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
    images,
    ...rest
  } = data;
  const attributes: Record<string, unknown> = {};

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
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
      ...(images !== undefined ? {images} : {}),
      ...(Object.keys(attributes).length > 0 ? {attributes} : {}),
    })
    .then(res => ({data: mapAdvertisement(res.data)}));
};

export const deleteAds = (id: string) => {
  return axiosInstance.delete(`/advertisements/${id}`);
};

// "تمدید آگهی": flags the ad as awaiting a new manual bank-transfer
// confirmation; expiresAt only actually moves once an admin confirms the
// payment in mahem-admin. Only applies to fee-required ads (see
// Category.adFeeToman) — mirrors renewStore.
export const renewAds = (id: string) => {
  return axiosInstance
    .post(`/advertisements/${id}/renew`)
    .then(res => ({data: mapAdvertisement(res.data)}));
};
