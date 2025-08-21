import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les roles.
 **/
export default class RoleService extends BaseService
{
    static authBaseUrl = "roles/"

    static async getAll() {
        return await this.axiosInstance.get(this.authBaseUrl)
    }

}
