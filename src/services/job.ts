import { handleRequest } from "."
import axiosInstance from "./axios-config"

export const createJob = (data:any)=> {
    return handleRequest(axiosInstance.post("/jobs", data))
}

export const getAllJobs = (query)=>{
    return handleRequest(axiosInstance.get(`/jobs`, {params: query}))
}

export const getJobsCategories = ()=>{
    return handleRequest(axiosInstance.get('/job/categories'))
}
