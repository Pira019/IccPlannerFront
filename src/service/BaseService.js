import axios from "axios";

/**
 * Service de base
 */
export default class BaseService
{
    static baseApiUrl = import.meta.env.VITE_APP_API_URL

    constructor() {}

    static axiosInstance = axios.create({
        baseURL : BaseService.baseApiUrl
    })

    static getToken() {
        return localStorage.getItem('token'); // Méthode pour récupérer le token
    }

    static setupInterceptors()
    {
        this.axiosInstance.interceptors.request.use(config => {
            const token = this.getToken();
            if(token)
            {
                config.headers['Authorization'] = `Bearer ${token}`
            }
            return config;
        })
    }
}

BaseService.setupInterceptors();