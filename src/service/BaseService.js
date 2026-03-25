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
                    const currentPath = window.location.pathname;
                    // Ne pas rediriger si on est sur login ou si c'est un appel claims (géré par le store)
                    const isClaims = error.config?.url?.includes('claims');
                    if (currentPath !== '/auth/login' && !isClaims) {
                        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
                    }
                }
                return Promise.reject(error);
            }
        );
    }
}

BaseService.setupInterceptors();
