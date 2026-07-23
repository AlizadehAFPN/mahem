import axiosInstance from './axios-config';

// A تخفیف‌یاب storefront (see Store in mahem-backend's schema): a
// business's own branded profile, shown at store_main.png in the design,
// aggregating the Advertisements it posts under itself via storeId.
export interface Store {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  images: string[];
  logo?: string | null;
  banner?: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  paymentStatus: 'PENDING' | 'PAID';
  paymentConfirmedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  categoryId: string;
  cityId: string;
  userId: string;
  city?: {id: string; name: string};
  createdAt: string;
}

export const getStore = (id: string): Promise<Store> =>
  axiosInstance.get(`/stores/${id}`).then(res => res.data);

// Public, approved+paid stores in the current city — the horizontal store
// carousel at the top of the تخفیف‌یاب main feed (main_entry.png design).
export const getStores = (query: {
  cityId?: string;
  categoryId?: string;
  limit?: number;
}): Promise<{items: Store[]; total: number}> =>
  axiosInstance.get('/stores', {params: query}).then(res => res.data);

// The current user's own storefront, if any — used to branch the "فروشگاه
// من" entry point between the create-store and my-store-dashboard screens.
export const getMyStore = (): Promise<Store | null> =>
  axiosInstance
    .get('/stores/mine', {params: {limit: 1}})
    .then(res => res.data?.items?.[0] ?? null);

export interface CreateStoreInput {
  name: string;
  categoryId: string;
  cityId: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  banner?: string;
  images?: string[];
}

export const createStore = (data: CreateStoreInput): Promise<Store> =>
  axiosInstance.post('/stores', data).then(res => res.data);

export const updateStore = (
  id: string,
  data: Partial<CreateStoreInput>,
): Promise<Store> =>
  axiosInstance.patch(`/stores/${id}`, data).then(res => res.data);

// "تمدید فروشگاه": flags the subscription as awaiting a new manual
// bank-transfer confirmation; subscriptionExpiresAt only actually moves once
// an admin confirms the payment in mahem-admin.
export const renewStore = (id: string): Promise<Store> =>
  axiosInstance.post(`/stores/${id}/renew`).then(res => res.data);
