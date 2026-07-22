import {AxiosResponse} from 'axios';

export * from './axios-config';
export * from './auth';
export * from './common';
export * from './ads';
export * from './discounts';
export * from './device';
export * from './job';
export * from './bookmarks';
export * from './reports';
export * from './notifications';
export * from './chat';
export * from './attribute-options';

export async function handleRequest<T>(
  request: Promise<AxiosResponse<T>>,
): Promise<T> {
  const response = await request;
  return response.data;
}
