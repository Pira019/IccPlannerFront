import axios from "axios";

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
         }
    })

    static getToken() {
        return localStorage.getItem('token'); // Méthode pour récupérer le token
    }

    //Méthode pour récupérer la langue
    static getLang() {
        return localStorage.getItem('Accept-Language'); //
    }

    static setupInterceptors()
    {
        this.axiosInstance.interceptors.request.use(config => {
            config.headers['Accept-Language'] = this.getLang()
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
