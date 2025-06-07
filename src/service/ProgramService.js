import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un programme
 **/
export default class ProgramService extends BaseService
{
    static authBaseUrl = "programs/"

    static async getPrograms(page,pageSize)
    {
        const params = new URLSearchParams({ page, pageSize });
        const endPoint = `${this.authBaseUrl}?${params.toString()}`;
        return await this.axiosInstance.get(endPoint)
    }

}
