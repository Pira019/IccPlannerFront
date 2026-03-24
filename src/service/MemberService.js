import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class MemberService extends BaseService
{
    static authBaseUrl = "members/"

    static async GetByDepartmentIdAsync(departMementId)
    {
        const endPoint = `${this.authBaseUrl}${departMementId}`;
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Obtenir le profil du membre connecté
     */
    static async getMyProfile()
    {
        const endPoint = `${this.authBaseUrl}me/profile`
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Obtenir le planning personnel du membre connecté pour un mois donné
     */
    static async getMyPlanning(month, year)
    {
        const endPoint = `${this.authBaseUrl}me/planning/${month}/${year}`
        return await this.axiosInstance.get(endPoint)
    }
}
