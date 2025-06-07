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
}
