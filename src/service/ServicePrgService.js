import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class ServicePrgService extends BaseService
{
    static authBaseUrl = "services/"
    static urlServiceprg = "serviceprg/"

    static async getAll()
    {
        return await this.axiosInstance.get(this.authBaseUrl);
    }

    static async create(payload)
    {
        return await this.axiosInstance.post(this.authBaseUrl, payload);
    }

    static async getDatesAsync(month,year,idDepart)
    {
        const endPoint = `${this.authBaseUrl}dates/${month}/${year}/${idDepart}`
        return await this.axiosInstance.get(endPoint);
    }

    static async getDepartmentServicesByDate(datesService)
    {
        const endPoint = `${this.authBaseUrl}department-services/${datesService}`
        return await this.axiosInstance.get(endPoint);
    }

    static async GetServicePrgByDepartAsync(idDepart, datePprg)
    {
        const endPoint = `${this.urlServiceprg}${idDepart}/${datePprg}`
        return await this.axiosInstance.get(endPoint);
    }

}
