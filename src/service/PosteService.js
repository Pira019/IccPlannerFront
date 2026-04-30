import BaseService from "./BaseService";

/**
 * Service pour gerer les postes.
 */
export default class PosteService extends BaseService
{
    static baseUrl = "postes/"

    /** Recuperer tous les postes */
    static async getAll()
    {
        return await this.axiosInstance.get(this.baseUrl)
    }

    /** Creer un poste */
    static async create(payload)
    {
        return await this.axiosInstance.post(this.baseUrl, payload)
    }

    /** Modifier un poste */
    static async update(id, payload)
    {
        return await this.axiosInstance.put(`${this.baseUrl}${id}`, payload)
    }

    /** Supprimer un poste */
    static async delete(id)
    {
        return await this.axiosInstance.delete(`${this.baseUrl}${id}`)
    }
}
