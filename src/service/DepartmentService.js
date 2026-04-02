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

    static async Departprogram(payload) {
         const endpoint = `${this.authBaseUrl}programs`
        return await this.axiosInstance.post(endpoint, payload)
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
    const params = new URLSearchParams();
    if (pageNumber !== undefined) params.append('pageNumber', pageNumber);
    if (pageSize !== undefined) params.append('pageSize', pageSize);

    const endPoint = params.toString()
        ? `${this.authBaseUrl}?${params.toString()}`
        : this.authBaseUrl;

    const response = await this.axiosInstance.get(endPoint);

        return await this.axiosInstance.get(endPoint)
    }

    // Supprimer le dept.
    static async deleteById(idDept)
    {
        var endPoint = `${this.authBaseUrl}${idDept}`
        return await this.axiosInstance.delete(endPoint)
    }

    /**
     * Obtenir le planning d'un département (services par mois/année)
     */
    static async getPlanning(idDept, month, year)
    {
        const endPoint = `${this.authBaseUrl}${idDept}/planning/${month}/${year}`
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Obtenir les membres d'un département avec leurs disponibilités pour une date
     */
    static async getMembersAvailability(idDept, date)
    {
        const endPoint = `${this.authBaseUrl}${idDept}/members/availability/${date}`
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Affecter un membre à un service du planning
     */
    static async assignMember(idDept, payload)
    {
        const endPoint = `${this.authBaseUrl}${idDept}/planning/assign`
        return await this.axiosInstance.post(endPoint, payload)
    }

    /**
     * Retirer un membre d'un service du planning
     */
    static async unassignMember(idDept, assignmentId)
    {
        const endPoint = `${this.authBaseUrl}${idDept}/planning/assign/${assignmentId}`
        return await this.axiosInstance.delete(endPoint)
    }

    /**
     * Obtenir toutes les assignations d'un département pour un mois donné
     */
    static async getMonthlyAssignments(idDept, month, year)
    {
        const endPoint = `${this.authBaseUrl}${idDept}/planning/monthly/${month}/${year}`
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Obtenir la liste des postes d'un département
     */
    static async getPostes(departmentId)
    {
        const endPoint = `${this.authBaseUrl}${departmentId}/postes`
        return await this.axiosInstance.get(endPoint)
    }

}
