import { useAuthStore } from "@/store/Auth";
import axios from "axios";
import AccountService from "./AccountService";

/**
 * Service de base
 */
export default class BaseService
{
    static baseApiUrl = import.meta.env.VITE_APP_API_URL

    constructor() {}

    static axiosInstance = axios.create({
        baseURL : BaseService.baseApiUrl,
        headers:
        {
            'Content-Type': 'application/json',
            'Accept-Language': 'application/json',
         },
         withCredentials: true
    })

    //Méthode pour récupérer la langue
    static getLang() {
        return localStorage.getItem('Accept-Language'); //
    }

    static setupInterceptors()
    {
        this.axiosInstance.interceptors.request.use(config => {
            config.headers['Accept-Language'] = this.getLang()
            return config;
        })
    }
}

BaseService.setupInterceptors();
