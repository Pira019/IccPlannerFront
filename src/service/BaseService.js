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
        });

        this.axiosInstance.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Token expiré ou non authentifié → rediriger vers login
                    const currentPath = window.location.pathname;
                    if (currentPath !== '/auth/login') {
                        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
                    }
                }
                return Promise.reject(error);
            }
        );
    }
}

BaseService.setupInterceptors();
