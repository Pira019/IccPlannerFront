import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un compte
 **/
export default class AccountService extends BaseService
{
    static authBaseUrl = `${this.baseApiUrl}account/`

    /**
     * Permet à l'utilisateur de s'authentifier avec ses informations de connexion.
     * @param {Object} LoginRequest -  Objet contenant les informations nécessaires pour l'authentification
     * @returns {Promise} - La réponse de la requête 
     */
    static async login(loginRequest)
    {
        const endPoint = "login"
        return await this.axiosInstance.post(endPoint, loginRequest)
    }
}