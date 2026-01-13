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

    static async getById(idDept)
    {
        const endpoint = `${this.authBaseUrl}${idDept}`
        return await this.axiosInstance.get(endpoint)
    }

    static async update(idDept,payload)
    {
        const endpoint = `${this.authBaseUrl}${idDept}`
        return await this.axiosInstance.put(endpoint,payload)
    }
     /**
     * Obtenir la liste des departements
     */
    static async get(pageNumber,pageSize)
    {
        var endPoint = `${this.authBaseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        return await this.axiosInstance.get(endPoint)
    }

    // Supprimer le dept.
    static async deleteById(idDept)
    {
        var endPoint = `${this.authBaseUrl}${idDept}`
        return await this.axiosInstance.delete(endPoint)
    }


}
