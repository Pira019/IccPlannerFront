import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class ServicePrgService extends BaseService
{
    static authBaseUrl = "services/"

    static async getDates(month,year)
    {
        const endPoint = `${this.authBaseUrl}dates/${month}/${year}`
        return await this.axiosInstance.get(endPoint);
    }

    static async getDepartmentServicesByDate(datesService)
    {
        const endPoint = `${this.authBaseUrl}department-services/${datesService}`
        return await this.axiosInstance.get(endPoint);
    }

}
