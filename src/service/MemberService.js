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

}
