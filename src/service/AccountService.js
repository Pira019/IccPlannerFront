import BaseService from "./BaseService";

/**
 * Ce service permet de gérer les actions d'un compte.
 **/
export default class AccountService extends BaseService
{
    static authBaseUrl = "accounts/"

    /**
     * Permet à l'utilisateur de s'authentifier avec ses informations de connexion.
     * @param {Object} LoginRequest -  Objet contenant les informations nécessaires pour l'authentification
     * @returns {Promise} - La réponse de la requête
     */
    static async login(loginRequest)
    {
        const endPoint = `${this.authBaseUrl}login`;
        return await this.axiosInstance.post(endPoint, loginRequest)
    }

     static get axiosInstance() {
        return BaseService.axiosInstance //
    }

    /**
     * Récupérer les claims.
     * @returns
     */
    static async claims()
    {
        const endPoint = `${this.authBaseUrl}claims`;
        return await this.axiosInstance.get(endPoint)
    }

    // Enregistrer un compte
     static async register(loginRequest)
    {
        const endPoint = `${this.authBaseUrl}register`;
        return await this.axiosInstance.post(endPoint, loginRequest)
    }

    /** Demander la réinitialisation du mot de passe */
    static async forgotPassword(email)
    {
        const endPoint = `${this.authBaseUrl}forgot-password`;
        return await this.axiosInstance.post(endPoint, { email })
    }

    /** Confirmer l'adresse email */
    static async confirmEmail(userId, code)
    {
        const endPoint = `${this.authBaseUrl}confirm-email`;
        return await this.axiosInstance.get(endPoint, { params: { userId, token: code } })
    }

    /** Réinitialiser le mot de passe avec le token */
    static async resetPassword(userId, token, newPassword)
    {
        const endPoint = `${this.authBaseUrl}reset-password`;
        return await this.axiosInstance.post(endPoint, { userId, token, newPassword })
    }
}
