import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class AvailabilityService extends BaseService
{
    static authBaseUrl = "availabilities/"

    static async addAvailability(servicePrgId)
    {
        const payload =
        {
            servicePrgId
        }
         return await this.axiosInstance.post(this.authBaseUrl, payload)
    }

    static async delete(servicePrgId)
        {
            const endPoint = `${this.authBaseUrl}${servicePrgId}`
            return await this.axiosInstance.delete(endPoint);
        }

}
