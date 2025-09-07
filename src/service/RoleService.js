import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les roles.
 **/
export default class RoleService extends BaseService
{
    static baseUrl = "roles/"

    static async getAll() {
        return await this.axiosInstance.get(this.baseUrl)
    }

    /** Créer un role */
     static async create(payload)
    { 
        return await this.axiosInstance.post(this.baseUrl,payload)
    }

}
