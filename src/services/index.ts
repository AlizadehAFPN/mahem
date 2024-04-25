import { AxiosResponse } from 'axios';

export * from './axios-config'
export * from './auth'
export * from './common'
export * from './ads'
export * from './stores'

export async function handleRequest<T>(
    request: Promise<AxiosResponse<T>>,
  ): Promise<T> {
    const response = await request;
    return response.data;
  }