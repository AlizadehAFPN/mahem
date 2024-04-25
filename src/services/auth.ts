import { handleRequest } from "."
import axiosInstance from "./axios-config"

export const register = (data:any)=> {
    return handleRequest(axiosInstance.post("/register", data))
}

export const sendActivationCode = (data: any)=>{
    return handleRequest(axiosInstance.put('/register', data))
}

export const checkUser = ()=>{
    return handleRequest(axiosInstance.get('/user'))
}
export const updateUser = (data: any)=>{
    return handleRequest(axiosInstance.put('/user', data))
}