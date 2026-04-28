import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class InvitationService extends BaseService
{
    static authBaseUrl = "invitations/"


     static async sendInvitation(payload)
    {
        return await this.axiosInstance.post(this.authBaseUrl,payload)
    }

    static async findInvalid(idInvitation)
    {
        const endPoint = `${this.authBaseUrl}${idInvitation}`;
        return await this.axiosInstance.get(endPoint)
    }

    /**
     * Importer des invitations en masse via un fichier Excel.
     * @param {File} file - Fichier Excel (.xlsx) avec colonnes Prenom, Email
     * @param {number} departmentId - Id du département
     */
    static async bulkInvite(file, departmentId)
    {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('departmentId', departmentId)
        return await this.axiosInstance.post(`${this.authBaseUrl}bulk`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

}
