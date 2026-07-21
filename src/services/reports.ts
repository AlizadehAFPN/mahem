import axiosInstance from './axios-config';

export const createReport = (
  advertisementId: string,
  data: {
    category: string;
    phone?: string;
    email?: string;
    description?: string;
  },
) => {
  return axiosInstance.post(`/advertisements/${advertisementId}/reports`, data);
};
