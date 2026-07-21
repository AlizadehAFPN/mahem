import axiosInstance from './axios-config';

export const getAttributeOptions = (groupKey: string) => {
  return axiosInstance
    .get('/attribute-options', {params: {groupKey}})
    .then(res => ({
      data: res.data.map((option: any) => ({title: option.label})),
    }));
};
