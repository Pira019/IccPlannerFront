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
        const endPoint = `${this.authBaseUrl}profile`
        return await this.axiosInstance.get(endPoint)
    }

    static async updateProfile(payload)
    {
        const endPoint = `${this.authBaseUrl}profile`
        return await this.axiosInstance.put(endPoint, payload)
    }

    static async getBirthdays(month)
    {
        const endPoint = `${this.authBaseUrl}birthdays/${month}`
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

    /**
     * Vérifier si l'utilisateur fait partie d'un département
     */
    static async belongsToDepartment(departmentId)
    {
        const endPoint = `${this.authBaseUrl}belongs/${departmentId}`
        return await this.axiosInstance.get(endPoint)
    }
}
