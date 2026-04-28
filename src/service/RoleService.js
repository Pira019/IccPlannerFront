import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les roles.
 **/
export default class RoleService extends BaseService
{
    static baseUrl = "roles/"

    static async getAll() {
        return await this.axiosInstance.get(this.baseUrl)
    }

    /** Créer un role */
    static async create(payload)
    { 
        return await this.axiosInstance.post(this.baseUrl, payload)
    }

    /** Récupérer tous les utilisateurs avec leurs rôles */
    static async getUsersWithRoles()
    {
        return await this.axiosInstance.get(`${this.baseUrl}users`)
    }

    /** Assigner un rôle à un utilisateur */
    static async assignRole(userId, roleName)
    {
        return await this.axiosInstance.post(`${this.baseUrl}assign`, { userId, roleName })
    }

    /** Retirer un rôle à un utilisateur */
    static async unassignRole(userId, roleName)
    {
        return await this.axiosInstance.post(`${this.baseUrl}unassign`, { userId, roleName })
    }

}
