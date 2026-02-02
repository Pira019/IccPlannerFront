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

    /*
        Voir la documentation de l'API
    */
     static async getProgramsFilter(payload)
    {
        const endPoint = `${this.authBaseUrl}filter`;
        return await this.axiosInstance.post(endPoint,payload)
    }

     /*
        Ajouter un programme
    */
     static async addPrg(payload)
    {
        const endPoint = `${this.authBaseUrl}`;
        return await this.axiosInstance.post(endPoint,payload)
    }

    static async EdtPrg(idPrg, payload)
    {
        const endPoint = `${this.authBaseUrl}${idPrg}`;
        return await this.axiosInstance.put(endPoint,payload)
    }
}
