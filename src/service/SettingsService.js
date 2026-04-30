import BaseService from "./BaseService";

/**
 * Service pour gérer les paramètres de l'application.
 */
export default class SettingsService extends BaseService
{
    static baseUrl = "settings/"

    /** Récupérer les paramètres de délai */
    static async getDeadlines()
    {
        return await this.axiosInstance.get(`${this.baseUrl}deadlines`)
    }

    /** Sauvegarder les paramètres de délai */
    static async saveDeadlines(payload)
    {
        return await this.axiosInstance.put(`${this.baseUrl}deadlines`, payload)
    }

    /** Supprimer une règle de délai */
    static async deleteRule(id)
    {
        return await this.axiosInstance.delete(`${this.baseUrl}deadlines/${id}`)
    }
}
