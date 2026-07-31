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
// snake_case register_code), banner/logo (uploaded image URLs), and lat/lng
// (set via the map location picker).
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
      lat: data.lat,
      lng: data.lng,
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
      lat: data.lat,
      lng: data.lng,
    })
    .then(res => ({data: mapJob(res.data)}));
};

export const deleteJob = (id: string) => {
  return axiosInstance.delete(`/jobs/${id}`);
};

// "تمدید صنف": flags the job posting as awaiting a new manual bank-transfer
// confirmation; expiresAt only actually moves once an admin confirms the
// payment in mahem-admin — mirrors renewStore/renewAds.
export const renewJob = (id: string) => {
  return axiosInstance
    .post(`/jobs/${id}/renew`)
    .then(res => ({data: mapJob(res.data)}));
};

// SingleJobScreen is normally handed the whole job object by the list it was
// opened from; this is for the cases that only have an id (a JOB_APPROVED /
// JOB_REJECTED notification tap). The owner can read their own non-approved
// posting here — see JobsService.findOne.
export const getSingleJob = (id: string) => {
  return axiosInstance
    .get(`/jobs/${id}`)
    .then(res => ({data: mapJob(res.data)}));
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
