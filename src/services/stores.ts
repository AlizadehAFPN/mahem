import { handleRequest } from "."
import axiosInstance from "./axios-config"

export const createStore = (data:any)=> {
    return handleRequest(axiosInstance.post("/stores", data))
}

export const getAllStore = ()=>{
    return handleRequest(axiosInstance.get(`/stores`))
}

export const getMyStore = ()=>{
    return handleRequest(axiosInstance.get(`/my/stores`))
}