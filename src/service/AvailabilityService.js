import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class AvailabilityService extends BaseService
{
    static authBaseUrl = "availabilities/"

    static async addAvailability(idDepart, servicePrgIds)
    {
        const payload =
        {
            servicePrgIds
        }
        const endPoint = `${this.authBaseUrl}${idDepart}`
        return await this.axiosInstance.post(endPoint, payload)
    }

    static async delete(servicePrgId)
        {
            const endPoint = `${this.authBaseUrl}${servicePrgId}`
            return await this.axiosInstance.delete(endPoint);
        }

    static async getMyAvailabilities(departmentId, month, year)
    {
        const endPoint = `${this.authBaseUrl}me/${departmentId}/${month}/${year}`
        return await this.axiosInstance.get(endPoint)
    }
}
