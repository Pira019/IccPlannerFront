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

}
