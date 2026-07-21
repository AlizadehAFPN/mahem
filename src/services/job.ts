import axiosInstance from './axios-config';
import store from '../stateManager';
import {normalizeListQuery} from './normalize-query';

function mapJob(item: any) {
  return {
    ...item,
    job_category_id: item.category && {
      ...item.category,
      title: item.category.name,
    },
  };
}

// Known/mapped fields: title, description, categoryId (from
// job_category_id), cityId (from city_id, falls back to the current user's
// city), salary, contact-info fields (manager/phone/registerCode/mobile/fax/
// address/telegram/instagram/email — registerCode mapped from the form's
// snake_case register_code), and banner/logo (uploaded image URLs). Dropped:
// lat, lng (no home in the new schema).
export const createJob = (data: any) => {
  const salary =
    data.salary !== undefined && data.salary !== ''
      ? Number(data.salary)
      : undefined;

  return axiosInstance
    .post('/jobs', {
      title: data.title,
      description: data.description,
      categoryId: data.job_category_id,
      cityId: data.city_id ?? store.getState().user.cityId,
      salary,
      manager: data.manager,
      phone: data.phone,
      registerCode: data.register_code,
      mobile: data.mobile,
      fax: data.fax,
      address: data.address,
      telegram: data.telegram,
      instagram: data.instagram,
      email: data.email,
      banner: data.banner,
      logo: data.logo,
    })
    .then(res => ({data: mapJob(res.data)}));
};

export const updateJob = (id: string, data: any) => {
  const salary =
    data.salary !== undefined && data.salary !== ''
      ? Number(data.salary)
      : undefined;

  return axiosInstance
    .patch(`/jobs/${id}`, {
      title: data.title,
      description: data.description,
      categoryId: data.job_category_id,
      cityId: data.city_id,
      salary,
      manager: data.manager,
      phone: data.phone,
      registerCode: data.register_code,
      mobile: data.mobile,
      fax: data.fax,
      address: data.address,
      telegram: data.telegram,
      instagram: data.instagram,
      email: data.email,
      banner: data.banner,
      logo: data.logo,
    })
    .then(res => ({data: mapJob(res.data)}));
};

export const deleteJob = (id: string) => {
  return axiosInstance.delete(`/jobs/${id}`);
};

export const getMyJobs = (query?: any) => {
  return axiosInstance
    .get('/jobs/mine', {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        jobs: res.data.items.map(mapJob),
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};

export const getAllJobs = (query: any) => {
  return axiosInstance
    .get('/jobs', {params: normalizeListQuery(query)})
    .then(res => ({
      data: {
        jobs: res.data.items.map(mapJob),
        pagination: {
          current_page: res.data.page,
          total_pages: Math.max(1, Math.ceil(res.data.total / res.data.limit)),
        },
      },
    }));
};

export const getJobsCategories = () => {
  return axiosInstance
    .get('/categories', {params: {type: 'JOB'}})
    .then(res => ({
      data: res.data.map((category: any) => ({
        ...category,
        title: category.name,
        logo: category.icon,
      })),
    }));
};
