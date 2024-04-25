import { handleRequest } from "."
import axiosInstance from "./axios-config"

export const getAdsCategories = ()=> {
    return handleRequest(axiosInstance.get("/categories"))
}

export const createAds = (data)=> {
    return handleRequest(axiosInstance.post("/advertisements", data))
}

export const getAds = (query: any)=>{
    return handleRequest(axiosInstance.get('/advertisements', {params: query}))
}

export const getSingleAds = (id: string)=>{
    return handleRequest(axiosInstance.get(`/advertisements/${id}`))
}

export const getMyAds = (query: any)=>{
    return handleRequest(axiosInstance.get('/my/advertisements', {params: query}))
}
