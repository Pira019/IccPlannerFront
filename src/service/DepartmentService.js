import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un compte
 **/
export default class DepartmentService extends BaseService
{
    static authBaseUrl = "departments/"

    /**
     * Ajout un département.
     */
    static async add(payload)
    {
        return await this.axiosInstance.post(this.authBaseUrl, payload)
    }

     /**
     * Obtenir la liste des departements
     */
    static async get(pageNumber,pageSize)
    {
        var endPoint = `${this.authBaseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        return await this.axiosInstance.get(endPoint)
    }
}
