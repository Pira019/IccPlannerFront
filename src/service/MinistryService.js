import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un compte
 **/
export default class MinistryService extends BaseService
{
    static authBaseUrl = "ministries/"

    /**
     * Ajout un ministère.
     */
    static async add(AddMinistryRequest)
    {
        return await this.axiosInstance.post(this.authBaseUrl, AddMinistryRequest)
    }

    static async getMinistries() {
        return await this.axiosInstance.get(this.authBaseUrl)
    }

}
