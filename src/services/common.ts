import { handleRequest } from "."
import axiosInstance from "./axios-config"

export const upload = (data:any)=> {
    return handleRequest(axiosInstance.post("/upload", data, {headers:{"content-type": "multipart/form-data"}}))
}

export const getCities = ()=>{
    return handleRequest(axiosInstance.get('/cities'))
}

export const getAllCategories = ()=>{
    return handleRequest(axiosInstance.get('/categories'))
}

export const getBanner = ()=>{
    return handleRequest(axiosInstance.get('/banners'))
}