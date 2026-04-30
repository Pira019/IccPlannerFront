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

    /**
     * Ajouter un service à un programme d'un département.
     */
    static async addServicePrg(payload)
    {
        const endPoint = `${this.authBaseUrl}program-department`;
        return await this.axiosInstance.post(endPoint, payload)
    }

    static async deleteServicePrg(servicePrgId)
    {
        const endPoint = `serviceprg/${servicePrgId}`;
        return await this.axiosInstance.delete(endPoint)
    }

    static async updateServicePrg(servicePrgId, payload)
    {
        const endPoint = `serviceprg/${servicePrgId}`;
        return await this.axiosInstance.put(endPoint, payload)
    }
}
