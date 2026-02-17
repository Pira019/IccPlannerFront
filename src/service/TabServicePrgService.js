import BaseService from "./BaseService";

/**
 *  Ce service permet de gérer les actions de Permission.
 **/
export default class TabServicePrgService extends BaseService
{
    static authBaseUrl = "services/"

    static async GetTabServicesPrgAsync(payload)
    {
        const endPoint = `${this.authBaseUrl}search-programs`;
        return await this.axiosInstance.post(endPoint,payload)
    }
}
