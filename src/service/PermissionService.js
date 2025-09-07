import BaseService from "./BaseService";

/**
 *  Ce service permet de gérer les actions de Permission.
 **/
export default class PermissionService extends BaseService
{
    static authBaseUrl = "permissions/"

    static async getAll()
    {
        return await this.axiosInstance.get(this.authBaseUrl)
    } 
}
